import type { WizardStep } from '../../../domain/types';
import { WIZARD_STEPS } from '../../../domain/constants';
import type { ScoreBreakdown } from '../../../domain/types';
import { ScoreRing } from './ScoreRing';

interface SidebarProps {
  currentStep: WizardStep;
  showResult: boolean;
  score: ScoreBreakdown;
  onStepClick: (step: WizardStep) => void;
}

export function Sidebar({ currentStep, showResult, score, onStepClick }: SidebarProps) {
  return (
    <aside className="sidebar">
      <nav className="steps-nav">
        {WIZARD_STEPS.map(({ step, title, desc, icon }) => {
          const isActive = currentStep === step && !showResult;
          const isCompleted = step < currentStep && !showResult;

          return (
            <div
              key={step}
              className={`step-item${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}`}
              onClick={() => onStepClick(step as WizardStep)}
            >
              <div className="step-number">
                {isCompleted ? <i className="fas fa-check" /> : step}
              </div>
              <div className="step-info">
                <span className="step-title">{title}</span>
                <span className="step-desc">{desc}</span>
              </div>
            </div>
          );
        })}
      </nav>
      <ScoreRing score={score} />
    </aside>
  );
}
