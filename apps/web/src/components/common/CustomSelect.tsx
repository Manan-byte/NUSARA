import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X, Sparkles } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  badge?: string;
}

export interface CustomSelectProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: (string | CustomSelectOption)[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  labelClassName?: string;
  error?: string;
  searchable?: boolean;
  creatable?: boolean;
  dropUp?: boolean;
}

/**
 * Normalisasi fonetik & ejaan Bahasa Indonesia agar tahan salah ketik (typo-tolerant)
 */
function normalizePhoneticId(str: string): string {
  return str
    .toLowerCase()
    .replace(/[./\-_#,()]/g, ' ')
    .replace(/\b(blok|block|blk|bl)\b/g, 'blok')
    .replace(/\b(bapak|pak|bp|bpk)\b/g, 'bapak')
    .replace(/\b(ibu|bu|ib)\b/g, 'ibu')
    .replace(/sy|sh/g, 's')
    .replace(/kh|ch/g, 'k')
    .replace(/dj/g, 'j')
    .replace(/tj/g, 'c')
    .replace(/oe/g, 'u')
    .replace(/([a-z])\1+/g, '$1') // budii -> budi, sitti -> siti
    .replace(/([a-z])(\d)/g, '$1 $2') // d8 -> d 8
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Jarak edit Damerau-Levenshtein (mendukung huruf kurang, lebih, salah, atau terbalik/transposisi)
 */
function damerauLevenshtein(a: string, b: string): number {
  const alen = a.length;
  const blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  if (Math.abs(alen - blen) > 3) return Math.abs(alen - blen);

  const dp: number[][] = Array.from({ length: alen + 1 }, () =>
    new Array(blen + 1).fill(0)
  );
  for (let i = 0; i <= alen; i++) dp[i][0] = i;
  for (let j = 0; j <= blen; j++) dp[0][j] = j;

  for (let i = 1; i <= alen; i++) {
    for (let j = 1; j <= blen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
      }
    }
  }
  return dp[alen][blen];
}

function isSubsequence(shortStr: string, longStr: string): boolean {
  let i = 0;
  for (let j = 0; j < longStr.length && i < shortStr.length; j++) {
    if (shortStr[i] === longStr[j]) i++;
  }
  return i === shortStr.length;
}

/**
 * Skor kecocokan AI Smart Fuzzy & Typo-Tolerant (0 = tidak cocok, 100 = sangat cocok)
 */
export function aiFuzzyScore(
  rawQuery: string,
  primaryText: string,
  secondaryText = ''
): number {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return 100;

  const pLower = primaryText.toLowerCase().trim();
  const pCompact = pLower.replace(/[\s./\-_#]/g, '');
  const qCompact = q.replace(/[\s./\-_#]/g, '');
  const qNoBlok = q.replace(/^(blok|block|blk|bl)\s*/i, '').trim();

  // 1. Jika hanya 1 karakter (misal ketik "z" atau "d"): hanya cocokkan awal kata/kode utama agar akurat!
  if (qNoBlok.length === 1) {
    const ch = qNoBlok;
    const words = pLower
      .replace(/^blok\s+/i, '')
      .split(/[\s./\-_#]+/)
      .filter(Boolean);
    if (words[0] === ch) return 100; // "Blok Z" saat ketik "z" -> Skor 100 (#1)
    if (words.some((w) => w.startsWith(ch))) return 90; // "Blok D8" saat ketik "d" -> Skor 90
    return 0;
  }

  // 2. Kecocokan Persis / Awalan pada Label atau Kode
  if (pLower === q || pCompact === qCompact || pLower === `blok ${qNoBlok}`) {
    return 100;
  }
  if (
    pLower.startsWith(q) ||
    pLower.replace(/^blok\s+/i, '').startsWith(qNoBlok) ||
    pCompact.startsWith(qCompact)
  ) {
    return 95;
  }
  if (pLower.includes(q) || pCompact.includes(qCompact)) {
    return 88;
  }

  // 3. Normalisasi Fonetik & Token Multi-Kata + Toleransi Typo (Damerau-Levenshtein)
  const normQ = normalizePhoneticId(q);
  const normP = normalizePhoneticId(`${primaryText} ${secondaryText}`);
  if (normP.includes(normQ)) return 82;

  const qTokens = normQ.split(' ').filter((t) => t !== 'blok' && t.length > 0);
  const targetWords = normP.split(' ').filter(Boolean);
  const primaryWords = normalizePhoneticId(primaryText).split(' ').filter(Boolean);

  if (qTokens.length === 0) return 80;

  let totalScore = 0;
  for (const qt of qTokens) {
    let bestTokenScore = 0;
    for (const tw of targetWords) {
      const isPrimaryWord = primaryWords.includes(tw);
      const weight = isPrimaryWord ? 1 : 0.75;
      if (tw === qt) {
        bestTokenScore = Math.max(bestTokenScore, 90 * weight);
      } else if (tw.startsWith(qt) || (qt.length >= 3 && qt.startsWith(tw) && tw.length >= 3)) {
        bestTokenScore = Math.max(bestTokenScore, 82 * weight);
      } else if (tw.includes(qt)) {
        bestTokenScore = Math.max(bestTokenScore, 75 * weight);
      } else if (qt.length >= 3 && tw.length >= 3) {
        const dist = damerauLevenshtein(qt, tw);
        const prefixDist =
          tw.length > qt.length
            ? damerauLevenshtein(qt, tw.slice(0, qt.length))
            : dist;
        const minDist = Math.min(dist, prefixDist);
        const maxAllowed = qt.length <= 4 ? 1 : 2;
        if (minDist <= maxAllowed) {
          bestTokenScore = Math.max(bestTokenScore, (72 - minDist * 12) * weight);
        } else if (qt.length >= 3 && isSubsequence(qt, tw)) {
          bestTokenScore = Math.max(bestTokenScore, 52 * weight);
        }
      }
    }
    if (bestTokenScore === 0) return 0;
    totalScore += bestTokenScore;
  }

  return Math.round(totalScore / qTokens.length);
}

/**
 * Helper boolean untuk semua kolom pencarian (IPL, PJU, Warga, Ronda, Pengumuman)
 */
export function aiFuzzyMatch(
  rawQuery: string,
  primaryText: string,
  secondaryText = ''
): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;
  return aiFuzzyScore(rawQuery, primaryText, secondaryText) > 0;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  className = '',
  buttonClassName,
  labelClassName,
  error,
  searchable = true,
  creatable = false,
  dropUp = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption =
    normalizedOptions.find((opt) => opt.value === value) ||
    (value ? { value, label: value.startsWith('Blok ') ? value : `Blok ${value}` } : undefined);

  // Hitung skor AI Fuzzy & urutkan hasil paling relevan di urutan teratas
  const filteredOptions = normalizedOptions
    .map((opt) => ({
      opt,
      score: searchTerm.trim()
        ? aiFuzzyScore(searchTerm, `${opt.value} ${opt.label}`, opt.description || '')
        : 100,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.opt);

  const cleanCustomVal = searchTerm
    .trim()
    .replace(/^blok\s+/i, '')
    .toUpperCase();
  const canCreateCustom =
    creatable &&
    cleanCustomVal.length >= 1 &&
    cleanCustomVal.length <= 6 &&
    !normalizedOptions.some((o) => o.value.toUpperCase() === cleanCustomVal);

  // Deteksi otomatis apakah posisi tombol dekat bagian bawah layar agar dropdown membuka ke ATAS (tidak pernah terpotong!)
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpward(dropUp || (spaceBelow < 180 && rect.top > spaceBelow));
      }
      if (searchable) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 40);
      }
    }
  }, [isOpen, searchable, dropUp]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`block flex items-center gap-1 ${labelClassName || 'text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1'}`}>
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 text-left text-xs select-none transition-all duration-150 ${
          buttonClassName || 'h-9 px-3 rounded-xl font-semibold bg-[#F8F8F6] dark:bg-[#051E20] border border-stone-200/80 dark:border-[#D9B352]/40 text-[#1C221E] dark:text-white'
        } ${
          isOpen
            ? 'border-[#0B484C] ring-2 ring-[#D9B352]/40 bg-white dark:bg-[#072426] shadow-xs'
            : 'hover:border-[#D9B352]/70'
        } ${error ? 'border-rose-400 bg-rose-50/20' : ''}`}
      >
        <span
          className={`truncate ${
            selectedOption
              ? 'text-[#092C2E] dark:text-white font-bold'
              : 'text-stone-400 font-normal'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div
          className={`text-stone-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#0B484C] dark:text-[#F3D37A]' : ''
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {error && (
        <p className="text-[11px] font-semibold text-rose-500 mt-1">{error}</p>
      )}

      {/* Floating Dropdown Menu (Auto-Flip Upward jika di bawah layar agar TIDAK PERNAH terpotong!) */}
      {isOpen && (
        <div
          className={`absolute ${
            openUpward ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'
          } left-0 right-0 min-w-[220px] z-[80] bg-white dark:bg-[#072426] rounded-2xl border border-[#D9B352]/55 shadow-2xl shadow-black/20 p-1.5 max-h-52 flex flex-col animate-in fade-in zoom-in-95 duration-150 select-none`}
        >
          {searchable && (
            <div className="relative mb-1.5 px-1 pt-0.5 flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Ketik nama / blok (Tahan Typo)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs bg-[#F8F8F6] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-8 pr-7 py-1.5 text-[#092C2E] dark:text-white placeholder:text-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#D9B352]/40 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-[10px] transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <div className="overflow-y-auto flex-1 space-y-0.5 pr-0.5 max-h-36">
            {canCreateCustom && (
              <div
                onClick={() => {
                  onChange(cleanCustomVal);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold bg-[#FEF9EB] hover:bg-[#FAF1D6] text-[#0B484C] border border-[#D9B352]/60 cursor-pointer mb-1"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#9A7018]" />
                  <span>Gunakan &ldquo;Blok {cleanCustomVal}&rdquo;</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0B484C] text-[#F3D37A]">
                  Pilih
                </span>
              </div>
            )}

            {filteredOptions.length === 0 && !canCreateCustom ? (
              <div className="py-4 text-center text-xs text-slate-400 font-medium">
                <p>Tidak ditemukan hasil yang cocok</p>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="mt-1.5 text-[11px] text-[#0B484C] dark:text-[#F3D37A] font-bold hover:underline"
                  >
                    Tampilkan Semua Pilihan
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                const isDisabled = Boolean(opt.disabled);
                return (
                  <div
                    key={opt.value}
                    aria-disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isDisabled
                        ? 'bg-stone-100/80 dark:bg-stone-800/50 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-65'
                        : isSelected
                        ? 'bg-[#0B484C] text-[#F3D37A] font-bold shadow-2xs cursor-pointer'
                        : 'text-[#092C2E] dark:text-stone-200 hover:bg-[#FAF6EA] dark:hover:bg-stone-800 cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                              isDisabled
                                ? 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                                : 'bg-emerald-100 text-[#0B484C]'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.description && (
                        <span
                          className={`text-[10px] font-normal truncate ${
                            isDisabled
                              ? 'text-stone-400 dark:text-stone-500'
                              : isSelected
                              ? 'text-[#F3D37A]/80'
                              : 'text-stone-400'
                          }`}
                        >
                          {opt.description}
                        </span>
                      )}
                    </div>

                    {isSelected && !isDisabled && (
                      <div className="w-4 h-4 rounded-full bg-[#D9B352] text-[#062C2F] flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
