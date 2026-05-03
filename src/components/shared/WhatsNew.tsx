import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { getVersion } from '@tauri-apps/api/app';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  WHATS_NEW,
  shouldShowWhatsNew,
  markVersionAsSeen,
  type WhatsNewStep,
} from '@/lib/whatsNew';

const ACCENT_GRADIENTS: Record<WhatsNewStep['accent'], string> = {
  blue: 'from-blue-500 to-indigo-600',
  green: 'from-emerald-500 to-teal-600',
  purple: 'from-violet-500 to-purple-600',
  amber: 'from-amber-500 to-orange-600',
  pink: 'from-pink-500 to-rose-600',
};

const ACCENT_BG: Record<WhatsNewStep['accent'], string> = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-emerald-50 border-emerald-200',
  purple: 'bg-violet-50 border-violet-200',
  amber: 'bg-amber-50 border-amber-200',
  pink: 'bg-pink-50 border-pink-200',
};

const ACCENT_DOT: Record<WhatsNewStep['accent'], string> = {
  blue: 'bg-blue-600',
  green: 'bg-emerald-600',
  purple: 'bg-violet-600',
  amber: 'bg-amber-600',
  pink: 'bg-pink-600',
};

export function WhatsNew() {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState<string>('');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    getVersion()
      .then((v) => {
        setVersion(v);
        if (shouldShowWhatsNew(v)) {
          setOpen(true);
        }
      })
      .catch(() => {
        // se non riusciamo a leggere la versione, non mostriamo nulla
      });
  }, []);

  const content = WHATS_NEW[version];
  if (!content) return null;

  const totalSteps = content.steps.length;
  const isLastStep = stepIndex === totalSteps - 1;
  const step = content.steps[stepIndex];
  const Icon = step.icon;

  const handleClose = () => {
    markVersionAsSeen(version);
    setOpen(false);
    // reset per la prossima apertura (es. se l'utente cambia versione mentre app aperta)
    setStepIndex(0);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        {/* Hero header con gradient dinamico */}
        <div className={`bg-gradient-to-br ${ACCENT_GRADIENTS[step.accent]} px-8 pt-10 pb-12 text-white relative`}>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-90 mb-3">
            <span>HairGest v{version}</span>
            <span>·</span>
            <span>Cosa c'e' di nuovo</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3.5 shrink-0">
              <Icon className="w-7 h-7" strokeWidth={2} />
            </div>
            <div className="flex-1 pt-1">
              <DialogTitle className="text-2xl font-bold leading-tight mb-2 text-white">
                {step.title}
              </DialogTitle>
              <DialogDescription className="text-white/90 text-sm leading-relaxed">
                {step.description}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body con bullets */}
        <div className="px-8 py-6">
          {step.bullets && step.bullets.length > 0 && (
            <div className={`rounded-xl border ${ACCENT_BG[step.accent]} p-5 space-y-3`}>
              {step.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`${ACCENT_DOT[step.accent]} rounded-full p-0.5 shrink-0 mt-0.5`}>
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con step indicator e navigation */}
        <div className="px-8 pb-6 pt-2 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between gap-4 pt-4">
            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              {content.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStepIndex(i)}
                  className={`transition-all rounded-full ${
                    i === stepIndex
                      ? `w-8 h-2 ${ACCENT_DOT[step.accent]}`
                      : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Vai al passo ${i + 1}`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-3">
                {stepIndex + 1} / {totalSteps}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <Button variant="outline" size="sm" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Indietro
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {isLastStep ? (
                  <>
                    Inizia
                    <Check className="w-4 h-4 ml-1.5" />
                  </>
                ) : (
                  <>
                    Avanti
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
