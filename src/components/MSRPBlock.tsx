interface MSRPBlockProps {
  releaseMSRP: string | null;
  finalMSRP: string | null;
}

export function MSRPBlock({ releaseMSRP, finalMSRP }: MSRPBlockProps) {
  if (!releaseMSRP && !finalMSRP) return null;

  return (
    <div className="border border-stone-200 rounded-lg p-5 space-y-3">
      <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
        Historical Pricing
      </h3>

      <div className="space-y-2">
        {releaseMSRP && (
          <div className="flex justify-between items-baseline gap-4">
            <span className="text-xs text-stone-400 uppercase tracking-wider">
              Release MSRP
            </span>
            <span className="font-mono text-stone-800">{releaseMSRP}</span>
          </div>
        )}
        {finalMSRP && (
          <div className="flex justify-between items-baseline gap-4">
            <span className="text-xs text-stone-400 uppercase tracking-wider">
              Final MSRP
            </span>
            <span className="font-mono text-stone-800">{finalMSRP}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-stone-400 border-t border-stone-100 pt-3">
        Historical retail prices only. Not an estimate of current market value.
      </p>
    </div>
  );
}
