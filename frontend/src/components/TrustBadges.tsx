export function TrustBadges() {
  return (
    <div className="py-12 border-y border-[#d4a561]/20">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-[#8b7355] dark:text-[#d4c5b0] mb-8">
          Trusted by leading law firms and legal departments worldwide
        </p>

        {/* Trust Icons */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 max-w-4xl mx-auto">
          {/* SOC 2 Certified */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#d4a561]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#1a2e1a] dark:text-[#f5edd8]">SOC 2</p>
              <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">Type II Certified</p>
            </div>
          </div>

          {/* GDPR Compliant */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#d4a561]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#1a2e1a] dark:text-[#f5edd8]">GDPR</p>
              <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">Compliant</p>
            </div>
          </div>

          {/* 256-bit Encryption */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#d4a561]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#1a2e1a] dark:text-[#f5edd8]">AES-256</p>
              <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">Encryption</p>
            </div>
          </div>

          {/* 99.9% Uptime */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#d4a561]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#1a2e1a] dark:text-[#f5edd8]">99.9%</p>
              <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">Uptime SLA</p>
            </div>
          </div>

          {/* 24/7 Support */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#d4a561]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#d4a561]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#1a2e1a] dark:text-[#f5edd8]">24/7</p>
              <p className="text-xs text-[#8b7355] dark:text-[#d4c5b0]">Support</p>
            </div>
          </div>
        </div>

        {/* Client Logos Placeholder */}
        <div className="mt-12 pt-8 border-t border-[#d4a561]/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-60">
            {['Law Firm A', 'Legal Corp B', 'Associates C', 'Partners D'].map((name, idx) => (
              <div
                key={idx}
                className="h-16 rounded-lg bg-[#d4a561]/10 flex items-center justify-center text-[#8b7355] dark:text-[#d4c5b0] text-sm font-semibold"
              >
                {name}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#8b7355] dark:text-[#d4c5b0] mt-6">
            And hundreds more law firms worldwide
          </p>
        </div>
      </div>
    </div>
  )
}
