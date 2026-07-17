import type { ScoreBreakdown } from '../../../domain/types';
import { SCORE_CIRCUMFERENCE, SCORE_COLORS, SCORE_THRESHOLDS } from '../../../domain/constants';

interface ScoreRingProps {
  score: ScoreBreakdown;
}

function getScoreColor(total: number): string {
  if (total >= SCORE_THRESHOLDS.excellent) return SCORE_COLORS.excellent;
  if (total >= SCORE_THRESHOLDS.good) return SCORE_COLORS.good;
  if (total >= SCORE_THRESHOLDS.warning) return SCORE_COLORS.warning;
  return SCORE_COLORS.danger;
}

export function ScoreRing({ score }: ScoreRingProps) {
  const offset = SCORE_CIRCUMFERENCE - (score.total / 100) * SCORE_CIRCUMFERENCE;
  const color = getScoreColor(score.total);

  return (
    <div className="sidebar-stats">
      <h4>Score de Optimizacion</h4>
      <div className="score-ring">
        <svg viewBox="0 0 120 120">
          <circle className="score-bg" cx="60" cy="60" r="54" />
          <circle
            className="score-fill"
            cx="60"
            cy="60"
            r="54"
            style={{
              strokeDasharray: SCORE_CIRCUMFERENCE,
              strokeDashoffset: offset,
              stroke: color,
            }}
          />
        </svg>
        <div className="score-value">{score.total}</div>
      </div>
      <div className="score-details">
        <div className="score-row"><span>Titulo</span><span>{score.title}%</span></div>
        <div className="score-row"><span>Ficha tecnica</span><span>{score.specs}%</span></div>
        <div className="score-row"><span>Fotos</span><span>{score.photos}%</span></div>
        <div className="score-row"><span>Descripcion</span><span>{score.description}%</span></div>
        <div className="score-row"><span>SEO</span><span>{score.seo}%</span></div>
      </div>
    </div>
  );
}
