import React from 'react';
import { BentoCard, PillBadge, PillButton } from '@sim-warga/ui';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { PengumumanRecord } from '@sim-warga/types';

export interface FeaturedAgendaCardProps {
  agenda: PengumumanRecord;
  onViewAll: () => void;
}

export const FeaturedAgendaCard: React.FC<FeaturedAgendaCardProps> = ({
  agenda,
  onViewAll,
}) => {
  return (
    <BentoCard variant="light" className="p-6 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2.5">
            <PillBadge variant="verifikasi" size="sm">
              Agenda Terdekat
            </PillBadge>
            <span className="text-xs text-stone-500 font-medium">
              Kategori: {agenda.kategori}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            {agenda.judul}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-2 max-w-3xl leading-relaxed">
            {agenda.deskripsi}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200/70">
              <Calendar className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{agenda.tanggalAcara} ({agenda.waktu})</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200/70">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{agenda.lokasi}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200/70">
              <Users className="w-3.5 h-3.5 text-stone-500" />
              <span>Oleh: {agenda.author}</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 self-end lg:self-center">
          <PillButton
            variant="outline"
            size="sm"
            onClick={onViewAll}
            icon={<ArrowRight className="w-3.5 h-3.5 text-stone-600" />}
          >
            Semua Pengumuman
          </PillButton>
        </div>
      </div>
    </BentoCard>
  );
};
