import React, { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { PresenterSlot } from '../rams/presenterStore';

interface PresenterRosterProps {
  presenters: PresenterSlot[];
  onChangePresenter?: (index: number, nextName: string) => void;
  editable?: boolean;
  heading?: string;
  compact?: boolean;
}

export const PresenterRoster: React.FC<PresenterRosterProps> = ({
  presenters,
  onChangePresenter,
  editable = false,
  heading = 'Presentation Team',
  compact = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="pt-3 border-t border-white/15 pointer-events-auto">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-xs font-medium text-slate-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
          {heading}
        </div>
        {editable && onChangePresenter && (
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-200 hover:text-amber-300 bg-[#05070b]/55 px-1.5 py-0.5 rounded transition-colors cursor-pointer drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
          >
            {isEditing ? (
              <>
                <Check className="w-3 h-3" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Pencil className="w-3 h-3" />
                <span>Edit Names</span>
              </>
            )}
          </button>
        )}
      </div>
      <div
        className={
          compact
            ? 'grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-2'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-5 gap-y-2.5'
        }
      >
        {presenters.map((slot, index) => (
          <div key={slot.id} className="min-w-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
            <div className="text-[11px] font-mono-tabular text-slate-400 truncate">
              {slot.roleLabel}
            </div>
            {editable && isEditing && onChangePresenter ? (
              <div>
                <label htmlFor={`${slot.id}-input`} className="sr-only">
                  {slot.roleLabel}
                </label>
                <input
                  id={`${slot.id}-input`}
                  type="text"
                  value={slot.name}
                  maxLength={64}
                  onChange={(e) => onChangePresenter(index, e.target.value)}
                  placeholder={`Presenter Name 0${index + 1}`}
                  className="mt-1 w-full bg-transparent border-b border-amber-400/50 focus:border-amber-400 focus:outline-none py-0.5 text-sm font-medium text-slate-100 placeholder:text-slate-600 transition-colors"
                />
              </div>
            ) : (
              <div className="mt-0.5 text-sm font-medium text-slate-100 truncate">
                {slot.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
