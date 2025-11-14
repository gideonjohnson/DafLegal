import time
from datetime import datetime
from sqlmodel import Session, select
from app.workers.celery_app import celery_app
from app.core.database import engine
from app.models.contract import Contract, ContractAnalysis, ContractStatus, RiskLevel, ContractComparison
from app.models.usage import UsageRecord
from app.models.user import User
from app.services.storage import S3Storage
from app.services.document_processor import DocumentProcessor
from app.services.ai_analyzer import AIContractAnalyzer
from app.services.comparison_analyzer import ContractComparisonAnalyzer


@celery_app.task(bind=True, name="process_contract")
def process_contract_task(self, contract_id: int):
    """
    Background task to process uploaded contract
    """
    start_time = time.time()

    with Session(engine) as session:
        # Get contract
        contract = session.get(Contract, contract_id)
        if not contract:
            return {"error": "Contract not found"}

        try:
            # Update status to processing
            contract.status = ContractStatus.PROCESSING
            session.add(contract)
            session.commit()

            # Download file from S3
            storage = S3Storage()
            file_content = storage.download_file(contract.s3_key)

            # Extract text
            processor = DocumentProcessor()
            extracted_text, page_count, word_count = processor.process_file(
                file_content,
                contract.file_type
            )

            # Update contract metadata
            contract.page_count = page_count
            contract.word_count = word_count
            session.add(contract)
            session.commit()

            # Run AI analysis
            analyzer = AIContractAnalyzer()
            analysis_result = analyzer.analyze_contract(extracted_text)

            # Create analysis record
            analysis = ContractAnalysis(
                contract_id=contract.id,
                executive_summary=analysis_result["executive_summary"],
                parties=analysis_result["key_terms"]["parties"],
                effective_date=analysis_result["key_terms"].get("effective_date"),
                term_duration=analysis_result["key_terms"].get("term"),
                payment_terms=analysis_result["key_terms"].get("payment"),
                detected_clauses=analysis_result["detected_clauses"],
                missing_clauses=analysis_result["missing_clauses"],
                risk_score=analysis_result["risk_score"],
                overall_risk_level=RiskLevel(analysis_result["overall_risk_level"]),
                extracted_text=extracted_text[:50000],  # Store first 50k chars
                processing_time_seconds=time.time() - start_time
            )

            session.add(analysis)

            # Update contract status
            contract.status = ContractStatus.COMPLETED
            contract.processed_at = datetime.utcnow()
            session.add(contract)

            # Record usage
            user = session.get(User, contract.user_id)
            if user:
                user.pages_used_current_period += page_count
                user.files_used_current_period += 1
                session.add(user)

                usage_record = UsageRecord(
                    user_id=user.id,
                    resource_type="contract_analysis",
                    pages_consumed=page_count,
                    files_consumed=1,
                    contract_id=contract.id,
                    billing_period_start=user.billing_period_start,
                    billing_period_end=user.billing_period_end
                )
                session.add(usage_record)

            session.commit()

            return {
                "status": "completed",
                "contract_id": contract.contract_id,
                "pages_processed": page_count,
                "processing_time": time.time() - start_time
            }

        except Exception as e:
            # Mark as failed
            contract.status = ContractStatus.FAILED
            contract.error_message = str(e)
            session.add(contract)
            session.commit()

            return {"status": "failed", "error": str(e)}


@celery_app.task(bind=True, name="process_comparison")
def process_comparison_task(self, comparison_id: int):
    """
    Background task to compare two contract versions
    """
    start_time = time.time()

    with Session(engine) as session:
        # Get comparison record
        comparison = session.get(ContractComparison, comparison_id)
        if not comparison:
            return {"error": "Comparison not found"}

        try:
            # Update status to processing
            comparison.status = ContractStatus.PROCESSING
            session.add(comparison)
            session.commit()

            # Get both contracts
            original_contract = session.get(Contract, comparison.original_contract_id)
            revised_contract = session.get(Contract, comparison.revised_contract_id)

            if not original_contract or not revised_contract:
                raise ValueError("One or both contracts not found")

            # Ensure both contracts are processed
            if original_contract.status != ContractStatus.COMPLETED or \
               revised_contract.status != ContractStatus.COMPLETED:
                raise ValueError("Both contracts must be fully analyzed first")

            # Get analyses
            original_analysis = session.exec(
                select(ContractAnalysis).where(
                    ContractAnalysis.contract_id == original_contract.id
                )
            ).first()

            revised_analysis = session.exec(
                select(ContractAnalysis).where(
                    ContractAnalysis.contract_id == revised_contract.id
                )
            ).first()

            if not original_analysis or not revised_analysis:
                raise ValueError("Both contracts must have completed analyses")

            # Run comparison
            analyzer = ContractComparisonAnalyzer()
            comparison_result = analyzer.compare_contracts(
                original_text=original_analysis.extracted_text or "",
                revised_text=revised_analysis.extracted_text or "",
                original_analysis={
                    "detected_clauses": original_analysis.detected_clauses,
                    "risk_score": original_analysis.risk_score
                },
                revised_analysis={
                    "detected_clauses": revised_analysis.detected_clauses,
                    "risk_score": revised_analysis.risk_score
                }
            )

            # Update comparison record
            comparison.summary = comparison_result.get("summary")
            comparison.additions = comparison_result.get("additions", [])
            comparison.deletions = comparison_result.get("deletions", [])
            comparison.modifications = comparison_result.get("modifications", [])
            comparison.clause_changes = comparison_result.get("clause_changes", [])
            comparison.risk_delta = comparison_result.get("risk_delta")
            comparison.substantive_changes = comparison_result.get("substantive_changes", [])
            comparison.cosmetic_changes = comparison_result.get("cosmetic_changes", [])
            comparison.processing_time_seconds = time.time() - start_time
            comparison.status = ContractStatus.COMPLETED
            comparison.processed_at = datetime.utcnow()

            session.add(comparison)
            session.commit()

            return {
                "status": "completed",
                "comparison_id": comparison.comparison_id,
                "processing_time": time.time() - start_time
            }

        except Exception as e:
            # Mark as failed
            comparison.status = ContractStatus.FAILED
            comparison.error_message = str(e)
            session.add(comparison)
            session.commit()

            return {"status": "failed", "error": str(e)}
