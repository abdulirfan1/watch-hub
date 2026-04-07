import type { WatchSpecs } from "../types";

interface WatchSpecsGridProps {
  specs: WatchSpecs;
}

const SPEC_LABELS: Record<keyof WatchSpecs, string> = {
  caseSize: "Case Size",
  thickness: "Thickness",
  lugWidth: "Lug Width",
  caseMaterial: "Case Material",
  crystal: "Crystal",
  waterResistance: "Water Resistance",
  movement: "Movement",
  powerReserve: "Power Reserve",
  dialColor: "Dial Color",
  bracelet: "Bracelet / Strap",
  releaseMSRP: "Release MSRP",
  finalMSRP: "Final MSRP",
};

// MSRP fields are rendered separately in MSRPBlock — exclude from specs grid
const EXCLUDED_FROM_GRID: (keyof WatchSpecs)[] = ["releaseMSRP", "finalMSRP"];

export function WatchSpecsGrid({ specs }: WatchSpecsGridProps) {
  const rows = (Object.keys(SPEC_LABELS) as (keyof WatchSpecs)[])
    .filter((key) => !EXCLUDED_FROM_GRID.includes(key))
    .filter((key) => specs[key] !== null);

  if (rows.length === 0) return null;

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((key, i) => (
            <tr
              key={key}
              className={i % 2 === 0 ? "bg-amber-50" : "bg-amber-100/40"}
            >
              <td className="px-4 py-3 w-2/5 whitespace-nowrap align-top">
                <span className="text-stone-400 text-xs font-semibold tracking-widest uppercase">
                  {SPEC_LABELS[key]}
                </span>
              </td>
              <td className="px-4 py-3 text-stone-800 font-medium">{specs[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
