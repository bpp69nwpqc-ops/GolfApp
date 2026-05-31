const COURSES = [
  {
    id: 'damme',
    name: 'Damme Golf & Country Club',
    region: 'West-Vlaanderen',
    courses: [
      {
        id: 'presidents-nine',
        name: "President's Nine",
        holes: 9,
        par: 36,
        tees: ['black', 'white', 'yellow', 'blue', 'red', 'orange'],
        courseRating: {
          black:  { men: 74.2 },
          white:  { men: 72.8 },
          yellow: { men: 70.2 },
          blue:   { men: 67.5, ladies: 73.2 },
          red:    { ladies: 70.1 },
          orange: { men: 62.7, ladies: 66.7 }
        },
        slope: {
          black:  { men: 124 },
          white:  { men: 122 },
          yellow: { men: 119 },
          blue:   { men: 114, ladies: 127 },
          red:    { ladies: 119 },
          orange: { men: 103, ladies: 110 }
        },
        holeData: [
          { hole: 1, par: 4, meters: { black: 339, white: 328, yellow: 317, blue: 277, red: 270, orange: 270 }, si: { first9: 9,  second9: 10 } },
          { hole: 2, par: 4, meters: { black: 377, white: 355, yellow: 349, blue: 318, red: 277, orange: 234 }, si: { first9: 3,  second9: 4  } },
          { hole: 3, par: 3, meters: { black: 230, white: 205, yellow: 177, blue: 173, red: 162, orange: 115 }, si: { first9: 7,  second9: 8  } },
          { hole: 4, par: 5, meters: { black: 500, white: 500, yellow: 457, blue: 411, red: 406, orange: 364 }, si: { first9: 11, second9: 12 } },
          { hole: 5, par: 4, meters: { black: 412, white: 368, yellow: 362, blue: 324, red: 301, orange: 247 }, si: { first9: 5,  second9: 6  } },
          { hole: 6, par: 5, meters: { black: 548, white: 523, yellow: 495, blue: 454, red: 423, orange: 358 }, si: { first9: 1,  second9: 2  } },
          { hole: 7, par: 4, meters: { black: 321, white: 321, yellow: 280, blue: 271, red: 234, orange: 231 }, si: { first9: 15, second9: 16 } },
          { hole: 8, par: 3, meters: { black: 146, white: 146, yellow: 123, blue: 99,  red: 70,  orange: 67  }, si: { first9: 13, second9: 14 } },
          { hole: 9, par: 4, meters: { black: 331, white: 331, yellow: 305, blue: 273, red: 251, orange: 230 }, si: { first9: 17, second9: 18 } }
        ]
      },
      {
        id: 'championship',
        name: 'Championship Course',
        holes: 18,
        par: 72,
        tees: ['black', 'white', 'yellow', 'blue', 'red', 'orange'],
        courseRating: {
          black:  { men: 74.0 },
          white:  { men: 73.8 },
          yellow: { men: 72.3, ladies: 77.8 },
          blue:   { men: 69.4, ladies: 75.1 },
          red:    { men: 67.4, ladies: 72.4 },
          orange: { men: 65.3, ladies: 69.6 }
        },
        slope: {
          black:  { men: 136 },
          white:  { men: 136 },
          yellow: { men: 132, ladies: 138 },
          blue:   { men: 128, ladies: 132 },
          red:    { men: 125, ladies: 124 },
          orange: { men: 120, ladies: 119 }
        },
        holeData: [
          { hole:  1, par: 4, meters: { black: 343, white: 321, yellow: 312, blue: 299, red: 267, orange: 257 }, si: { first9:  9 } },
          { hole:  2, par: 4, meters: { black: 387, white: 385, yellow: 375, blue: 334, red: 325, orange: 269 }, si: { first9:  3 } },
          { hole:  3, par: 5, meters: { black: 490, white: 483, yellow: 465, blue: 436, red: 428, orange: 371 }, si: { first9:  5 } },
          { hole:  4, par: 4, meters: { black: 292, white: 292, yellow: 284, blue: 250, red: 246, orange: 246 }, si: { first9: 13 } },
          { hole:  5, par: 3, meters: { black: 135, white: 135, yellow: 129, blue: 125, red:  82, orange:  82 }, si: { first9: 17 } },
          { hole:  6, par: 4, meters: { black: 303, white: 303, yellow: 293, blue: 281, red: 270, orange: 258 }, si: { first9: 11 } },
          { hole:  7, par: 4, meters: { black: 375, white: 375, yellow: 350, blue: 336, red: 299, orange: 292 }, si: { first9:  7 } },
          { hole:  8, par: 3, meters: { black: 185, white: 167, yellow: 155, blue: 139, red: 112, orange: 108 }, si: { first9: 15 } },
          { hole:  9, par: 4, meters: { black: 439, white: 426, yellow: 379, blue: 363, red: 318, orange: 318 }, si: { first9:  1 } },
          { hole: 10, par: 4, meters: { black: 295, white: 295, yellow: 277, blue: 245, red: 235, orange: 235 }, si: { first9: 18 } },
          { hole: 11, par: 4, meters: { black: 386, white: 386, yellow: 376, blue: 308, red: 298, orange: 259 }, si: { first9:  4 } },
          { hole: 12, par: 5, meters: { black: 474, white: 474, yellow: 449, blue: 436, red: 400, orange: 325 }, si: { first9:  6 } },
          { hole: 13, par: 3, meters: { black: 220, white: 202, yellow: 193, blue: 184, red: 175, orange: 122 }, si: { first9: 14 } },
          { hole: 14, par: 4, meters: { black: 373, white: 373, yellow: 365, blue: 306, red: 300, orange: 256 }, si: { first9:  2 } },
          { hole: 15, par: 4, meters: { black: 315, white: 315, yellow: 300, blue: 291, red: 278, orange: 252 }, si: { first9: 16 } },
          { hole: 16, par: 5, meters: { black: 479, white: 479, yellow: 475, blue: 418, red: 409, orange: 401 }, si: { first9: 10 } },
          { hole: 17, par: 3, meters: { black: 221, white: 182, yellow: 170, blue: 164, red: 148, orange: 148 }, si: { first9: 12 } },
          { hole: 18, par: 5, meters: { black: 511, white: 479, yellow: 467, blue: 447, red: 410, orange: 364 }, si: { first9:  8 } }
        ]
      },
      {
        id: 'compact',
        name: 'Compact Course',
        holes: 9,
        par: 31,
        tees: ['yellow', 'red'],
        courseRating: {
          yellow: { men: null },
          red:    { ladies: null }
        },
        slope: {
          yellow: { men: null },
          red:    { ladies: null }
        },
        holeData: [
          { hole: 1, par: 3, meters: { yellow: 102, red: 102 }, si: { first9: 13, second9: 14 } },
          { hole: 2, par: 4, meters: { yellow: 134, red: 134 }, si: { first9:  9, second9: 10 } },
          { hole: 3, par: 3, meters: { yellow: 132, red: 132 }, si: { first9:  1, second9:  2 } },
          { hole: 4, par: 3, meters: { yellow:  74, red:  74 }, si: { first9: 17, second9: 18 } },
          { hole: 5, par: 3, meters: { yellow:  69, red:  69 }, si: { first9: 15, second9: 16 } },
          { hole: 6, par: 4, meters: { yellow: 180, red: 180 }, si: { first9:  3, second9:  4 } },
          { hole: 7, par: 3, meters: { yellow: 106, red: 106 }, si: { first9:  7, second9:  8 } },
          { hole: 8, par: 4, meters: { yellow: 209, red: 209 }, si: { first9:  5, second9:  6 } },
          { hole: 9, par: 4, meters: { yellow: 140, red: 140 }, si: { first9: 11, second9: 12 } }
        ]
      }
    ]
  }
];

function getClub(clubId) {
  return COURSES.find(c => c.id === clubId) || null;
}

function getCourse(clubId, courseId) {
  const club = getClub(clubId);
  return club ? club.courses.find(c => c.id === courseId) || null : null;
}

function getHoleData(clubId, courseId, holeNumber, playedTwice, tee) {
  const course = getCourse(clubId, courseId);
  if (!course) return null;
  const isSecond = playedTwice && holeNumber > course.holes;
  const physIndex = isSecond ? (holeNumber - course.holes - 1) : (holeNumber - 1);
  const hole = course.holeData[physIndex];
  if (!hole) return null;
  return {
    hole: holeNumber,
    par: hole.par,
    meters: hole.meters[tee] || 0,
    si: isSecond ? hole.si.second9 : hole.si.first9
  };
}

function getCoursePars(clubId, courseId, totalHoles) {
  const course = getCourse(clubId, courseId);
  if (!course) return [];
  return Array.from({ length: totalHoles }, (_, i) => course.holeData[i % course.holeData.length].par);
}

function getCourseSIs(clubId, courseId, totalHoles, playedTwice, tee) {
  return Array.from({ length: totalHoles }, (_, i) => {
    const hd = getHoleData(clubId, courseId, i + 1, playedTwice, tee);
    return hd ? hd.si : (i + 1);
  });
}

function computePlayerCH(player, round) {
  if (player.currentHandicap == null) return 0;
  const course = getCourse(round.clubId, round.courseId);
  if (!course || !course.slope || !course.courseRating) {
    return Math.round(player.currentHandicap * round.totalHoles / 18);
  }
  const tee   = round.tee;
  const slope = (course.slope.men && course.slope.men[tee]) || (course.slope.ladies && course.slope.ladies[tee]) || 113;
  const cr    = (course.courseRating.men && course.courseRating.men[tee]) || (course.courseRating.ladies && course.courseRating.ladies[tee]) || course.par;
  const ch18  = Scoring.calcCourseHandicap(player.currentHandicap, slope, cr, course.par);
  return round.totalHoles === 9 ? Math.round(ch18 / 2) : ch18;
}
