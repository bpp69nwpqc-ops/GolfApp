const Scoring = {
  getScoreBadge(strokes, par) {
    const diff = strokes - par;
    if (diff <= -2) return { label: String(diff), bg: '#E1F5EE', color: '#085041' };
    if (diff === -1) return { label: '-1',         bg: '#E1F5EE', color: '#085041' };
    if (diff === 0)  return { label: 'E',          bg: '#F7F3EE', color: '#1A1A1A' };
    if (diff === 1)  return { label: '+1',         bg: '#FCEBEB', color: '#A32D2D' };
    return { label: `+${diff}`, bg: '#FCEBEB', color: '#A32D2D' };
  },

  getStablefordPoints(netVsPar) {
    if (netVsPar <= -3) return 5;
    if (netVsPar === -2) return 4;
    if (netVsPar === -1) return 3;
    if (netVsPar === 0)  return 2;
    if (netVsPar === 1)  return 1;
    return 0;
  },

  calcCourseHandicap(hcpIndex, slope, courseRating, par) {
    return Math.round(hcpIndex * (slope / 113) + (courseRating - par));
  },

  holeStrokeAllowance(courseHandicap, si, totalHoles) {
    const base = Math.floor(courseHandicap / totalHoles);
    const extra = courseHandicap % totalHoles;
    return base + (si <= extra ? 1 : 0);
  },

  totalGross(scores, coursePars) {
    return scores.reduce((sum, s, i) => sum + (s !== null ? s : coursePars[i]), 0);
  },

  totalStableford(scores, coursePars) {
    return scores.reduce((total, score, i) => {
      const s = score !== null ? score : coursePars[i];
      return total + this.getStablefordPoints(s - coursePars[i]);
    }, 0);
  },

  determineWinner(round, players, courseHoles) {
    const ids = this.determineWinners(round, players, courseHoles);
    return ids.length > 0 ? ids[0] : null;
  },

  determineWinners(round, players, courseHoles) {
    if (!round.playerIds || round.playerIds.length === 0) return [];

    const pars = Array.from({ length: round.totalHoles }, (_, i) => {
      return courseHoles[i % courseHoles.length].par;
    });

    if (round.format === 'strokeplay') {
      const totals = round.playerIds.map(id => ({ id, score: this.totalGross(round.scores[id] || [], pars) }));
      const best   = Math.min(...totals.map(t => t.score));
      return totals.filter(t => t.score === best).map(t => t.id);
    }

    if (round.format === 'stableford') {
      const totals = round.playerIds.map(id => ({ id, score: this.totalStableford(round.scores[id] || [], pars) }));
      const best   = Math.max(...totals.map(t => t.score));
      return totals.filter(t => t.score === best).map(t => t.id);
    }

    return round.winner ? [round.winner] : [];
  }
};
