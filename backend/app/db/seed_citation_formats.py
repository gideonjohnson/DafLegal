"""
Seed Citation Formats

Populate common legal citation formats (Bluebook, ALWD, etc.)
"""

from sqlmodel import Session, select
from app.models.citation_checker import CitationFormat
from app.core.database import engine
import secrets


def seed_citation_formats():
    """Create common citation format templates"""

    formats = [
        # BLUEBOOK FORMATS
        {
            "name": "Bluebook",
            "citation_type": "case",
            "pattern": r"[\w\s]+v\.[\w\s]+,\s+\d+\s+[\w\.]+\s+\d+",
            "example": "Brown v. Board of Education, 347 U.S. 483 (1954)",
            "description": "Bluebook format for case citations - includes case name, volume, reporter, page, and year",
            "rules": {
                "case_name_italic": True,
                "include_year": True,
                "abbreviate_parties": False,
                "reporter_abbreviation": True
            },
            "required_elements": ["case_name", "volume", "reporter", "page", "year"]
        },
        {
            "name": "Bluebook",
            "citation_type": "statute",
            "pattern": r"\d+\s+U\.S\.C\.\s+§\s*\d+",
            "example": "42 U.S.C. § 1983",
            "description": "Bluebook format for U.S. Code citations",
            "rules": {
                "use_section_symbol": True,
                "abbreviate_code": True
            },
            "required_elements": ["title", "code_abbreviation", "section"]
        },
        {
            "name": "Bluebook",
            "citation_type": "regulation",
            "pattern": r"\d+\s+C\.F\.R\.\s+§\s*\d+",
            "example": "29 C.F.R. § 1910.1200",
            "description": "Bluebook format for Code of Federal Regulations",
            "rules": {
                "use_section_symbol": True,
                "abbreviate_cfr": True
            },
            "required_elements": ["title", "section"]
        },
        {
            "name": "Bluebook",
            "citation_type": "constitutional",
            "pattern": r"U\.S\.\s+Const\.\s+[\w\.]+",
            "example": "U.S. Const. art. I, § 8",
            "description": "Bluebook format for U.S. Constitution",
            "rules": {
                "abbreviate_constitution": True,
                "use_section_symbol": True
            },
            "required_elements": ["constitution", "article_or_amendment"]
        },

        # ALWD FORMATS
        {
            "name": "ALWD",
            "citation_type": "case",
            "pattern": r"[\w\s]+v\.[\w\s]+,\s+\d+\s+[\w\.]+\s+\d+",
            "example": "Brown v. Board of Education, 347 U.S. 483 (1954)",
            "description": "ALWD format for case citations - similar to Bluebook but with some differences",
            "rules": {
                "case_name_italic": True,
                "include_year": True,
                "abbreviate_parties": False
            },
            "required_elements": ["case_name", "volume", "reporter", "page", "year"]
        },
        {
            "name": "ALWD",
            "citation_type": "statute",
            "pattern": r"\d+\s+U\.S\.C\.\s+§\s*\d+",
            "example": "42 U.S.C. § 1983",
            "description": "ALWD format for U.S. Code citations",
            "rules": {
                "use_section_symbol": True
            },
            "required_elements": ["title", "code_abbreviation", "section"]
        },

        # CHICAGO MANUAL OF STYLE
        {
            "name": "Chicago",
            "citation_type": "case",
            "pattern": r"[\w\s]+v\.[\w\s]+,\s+\d+\s+[\w\.]+\s+\d+",
            "example": "Brown v. Board of Education, 347 U.S. 483 (1954)",
            "description": "Chicago Manual of Style format for case citations",
            "rules": {
                "case_name_italic": True,
                "include_year": True,
                "use_full_case_name": True
            },
            "required_elements": ["case_name", "volume", "reporter", "page", "year"]
        },

        # APA STYLE (for legal documents)
        {
            "name": "APA",
            "citation_type": "case",
            "pattern": r"[\w\s]+v\.[\w\s]+,\s+\d+\s+[\w\.]+\s+\d+",
            "example": "Brown v. Board of Education, 347 U.S. 483 (1954)",
            "description": "APA format for case citations",
            "rules": {
                "case_name_italic": True,
                "include_year": True
            },
            "required_elements": ["case_name", "volume", "reporter", "page", "year"]
        },

        # MLA STYLE
        {
            "name": "MLA",
            "citation_type": "case",
            "pattern": r"[\w\s]+v\.[\w\s]+",
            "example": "Brown v. Board of Education. 347 U.S. 483. 1954.",
            "description": "MLA format for case citations",
            "rules": {
                "case_name_italic": True,
                "use_periods": True
            },
            "required_elements": ["case_name", "volume", "reporter", "page", "year"]
        }
    ]

    with Session(engine) as session:
        # Check if formats already exist
        existing = session.exec(select(CitationFormat)).first()
        if existing:
            print("Citation formats already seeded. Skipping...")
            return

        # Insert formats
        for fmt_data in formats:
            citation_format = CitationFormat(
                format_id=f"fmt_{secrets.token_hex(8)}",
                name=fmt_data["name"],
                citation_type=fmt_data["citation_type"],
                pattern=fmt_data["pattern"],
                example=fmt_data["example"],
                description=fmt_data["description"],
                rules=fmt_data["rules"],
                required_elements=fmt_data["required_elements"],
                is_active=True
            )
            session.add(citation_format)

        session.commit()
        print(f"✅ Seeded {len(formats)} citation formats")


if __name__ == "__main__":
    print("Seeding citation formats...")
    seed_citation_formats()
    print("Done!")
