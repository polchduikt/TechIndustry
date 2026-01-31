class QuizService {
    static sanitizeQuiz(quiz) {
        return {
            moduleId: quiz.moduleId,
            title: quiz.title,
            passingScore: quiz.passingScore,
            questions: quiz.questions.map(q => ({
                id: q.id,
                type: q.type,
                question: q.question,
                options: q.options,
                language: q.language,
                starterCode: q.starterCode,
                image: q.image
            }))
        };
    }

    static checkQuiz(quiz, userAnswers) {
        let score = 0;
        let maxScore = 0;

        for (const q of quiz.questions) {
            const weight = q.type === 'code' ? 2 : 1;
            maxScore += weight;

            const answer = userAnswers?.[q.id];
            if (answer === undefined) continue;

            let correct = false;

            // SINGLE
            if (q.type === 'single') {
                correct = Number(answer) === Number(q.correctAnswer);
            }

            if (q.type === 'multiple') {
                if (Array.isArray(answer) && Array.isArray(q.correctAnswer)) {
                    const a = answer.map(Number).sort().join(',');
                    const b = q.correctAnswer.map(Number).sort().join(',');
                    correct = a === b;
                }
            }

            if (q.type === 'code' && q.expectedPattern) {
                const regex = new RegExp(q.expectedPattern, 'm');
                correct = regex.test(answer);
            }

            if (correct) score += weight;
        }

        const percent = maxScore === 0
            ? 0
            : Math.round((score / maxScore) * 100);

        return {
            percent,
            passed: percent >= quiz.passingScore
        };
    }
}

module.exports = QuizService;
