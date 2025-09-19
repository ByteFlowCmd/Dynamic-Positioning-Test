function quizApp() {
  return {
    darkMode: false,
    currentView: "setup", // setup, quiz, results
    selectedSource: "NI",
    testType: "30",
    questions: [],
    currentQuestionIndex: 0,
    currentQuestion: null,
    selectedAnswers: [],
    questionAnswered: false,
    correctAnswers: 0,
    answeredQuestions: 0,
    userAnswers: [],

    init() {
      // Check for saved dark mode preference
      if (
        localStorage.getItem("darkMode") === "true" ||
        (!localStorage.getItem("darkMode") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        this.darkMode = true;
        document.documentElement.classList.add("dark");
      }
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (this.darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("darkMode", "true");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("darkMode", "false");
      }
    },

    async loadQuestions() {
      let allQuestions = [];

      try {
        if (this.selectedSource === "ALL") {
          // Load all sources
          const sources = [
            { file: "NI.json", name: "NI" },
            { file: "K.json", name: "K" },
            { file: "EX.json", name: "EX" },
          ];

          for (const source of sources) {
            try {
              const questions = await this.fetchQuestions(source.file);
              allQuestions = [...allQuestions, ...questions];
            } catch (error) {
              console.warn(`Failed to load ${source.file}:`, error);
              // Continue loading other sources even if one fails
            }
          }
        } else {
          // Load single source
          const fileName = `${this.selectedSource}.json`;
          allQuestions = await this.fetchQuestions(fileName);
        }

        // Shuffle questions
        allQuestions = this.shuffleArray(allQuestions);

        // Select based on test type
        if (this.testType === "30") {
          this.questions = allQuestions.slice(
            0,
            Math.min(30, allQuestions.length)
          );
        } else {
          this.questions = allQuestions;
        }

        // Initialize first question
        if (this.questions.length > 0) {
          this.currentQuestion = this.questions[0];
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        alert(
          "Failed to load questions. Please check that the JSON files are in the src/data/ folder."
        );
      }
    },

    async fetchQuestions(fileName) {
      try {
        const response = await fetch(`src/data/${fileName}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const questions = await response.json();

        // The JSON is already an array of questions
        // Ensure each question has the expected structure
        return questions.map((q) => ({
          id: q.id,
          source: q.source || fileName.replace(".json", ""),
          question: q.question,
          answers: q.answers || [],
        }));
      } catch (error) {
        console.error(`Error fetching ${fileName}:`, error);

        // Return fallback sample questions if file loading fails
        // This helps during development when JSON files might not be set up yet
        return this.getFallbackQuestions(fileName);
      }
    },

    getFallbackQuestions(fileName) {
      const source = fileName.replace(".json", "");
      console.log(`Using fallback questions for ${source}`);

      // Sample questions matching your JSON structure
      return [
        {
          id: `${source}-001`,
          source:
            source === "EX"
              ? "Exam"
              : source === "NI"
              ? "Nautical Institute"
              : "Kelson",
          question:
            "A Thruster malfunction may best be detected by observing which of the following?",
          answers: [
            { text: "A Thruster demand and feedback data.", correct: true },
            { text: "B Power plant output.", correct: false },
            {
              text: "C Noise and vibration levels from the thrusters.",
              correct: false,
            },
            { text: "D Thrust output over time.", correct: false },
          ],
        },
        {
          id: `${source}-002`,
          source:
            source === "EX"
              ? "Exam"
              : source === "NI"
              ? "Nautical Institute"
              : "Kelson",
          question:
            "During a Class 2 Operation, output from 1 of 2 bow tunnel thrusters is observed to be frozen at 30% thrust to Port. The DPO should:",
          answers: [
            {
              text: "A Stop DP operations and move the vessel to a safe location.",
              correct: true,
            },
            {
              text: "B Have the engineers stop the thruster and repair while DP operations continue.",
              correct: false,
            },
            {
              text: "C Do nothing as heading/position errors are within limits.",
              correct: false,
            },
            {
              text: "D Keep using the faulty thruster, monitor heading/position.",
              correct: false,
            },
          ],
        },
        {
          id: `${source}-003`,
          source:
            source === "EX"
              ? "Exam"
              : source === "NI"
              ? "Nautical Institute"
              : "Kelson",
          question:
            "The data taken into the mathematical model for the vessel which is above the waterline is affected by?",
          answers: [
            { text: "A The direction of the vessel move.", correct: false },
            { text: "B The speed of the vessel move.", correct: false },
            { text: "C Heave and Pitch.", correct: false },
            {
              text: "D The wind direction and strength in relation to the ship's head.",
              correct: true,
            },
          ],
        },
        {
          id: `${source}-004`,
          source:
            source === "EX"
              ? "Exam"
              : source === "NI"
              ? "Nautical Institute"
              : "Kelson",
          question:
            "Which equipment is mandatory under SOLAS regulations? (Select all that apply)",
          answers: [
            { text: "A GMDSS equipment", correct: true },
            { text: "B Life-saving appliances", correct: true },
            { text: "C Swimming pool", correct: false },
            { text: "D Fire detection systems", correct: true },
            { text: "E Entertainment systems", correct: false },
          ],
        },
        {
          id: `${source}-005`,
          source:
            source === "EX"
              ? "Exam"
              : source === "NI"
              ? "Nautical Institute"
              : "Kelson",
          question: "What is the primary purpose of Dynamic Positioning (DP)?",
          answers: [
            {
              text: "A To maintain a vessel's position and heading automatically",
              correct: true,
            },
            { text: "B To increase vessel speed", correct: false },
            { text: "C To reduce fuel consumption", correct: false },
            { text: "D To improve crew comfort", correct: false },
          ],
        },
      ];
    },

    shuffleArray(array) {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    },

    async startQuiz() {
      if (!this.selectedSource || !this.testType) return;

      // Reset quiz state
      this.currentQuestionIndex = 0;
      this.selectedAnswers = [];
      this.questionAnswered = false;
      this.correctAnswers = 0;
      this.answeredQuestions = 0;
      this.userAnswers = [];

      // Load questions
      await this.loadQuestions();

      if (this.questions.length === 0) {
        alert(
          "No questions available. Please ensure JSON files are properly loaded."
        );
        return;
      }

      // Switch to quiz view
      this.currentView = "quiz";
    },

    toggleAnswer(index) {
      if (this.questionAnswered) return;

      // Check if this question has multiple correct answers
      const correctAnswersCount = this.currentQuestion.answers.filter(
        (a) => a.correct
      ).length;

      if (correctAnswersCount === 1) {
        // Single answer question - replace selection
        this.selectedAnswers = [index];
      } else {
        // Multiple answer question - toggle selection
        const answerIndex = this.selectedAnswers.indexOf(index);
        if (answerIndex > -1) {
          this.selectedAnswers.splice(answerIndex, 1);
        } else {
          this.selectedAnswers.push(index);
        }
      }
    },

    confirmAnswer() {
      if (this.selectedAnswers.length === 0) return;

      this.questionAnswered = true;
      this.answeredQuestions++;

      // Check if all selected answers are correct
      let isCorrect = true;
      let correctCount = 0;

      this.currentQuestion.answers.forEach((answer, index) => {
        if (answer.correct) {
          correctCount++;
          if (!this.selectedAnswers.includes(index)) {
            isCorrect = false;
          }
        }
        if (!answer.correct && this.selectedAnswers.includes(index)) {
          isCorrect = false;
        }
      });

      // Also check if user selected all correct answers
      if (this.selectedAnswers.length !== correctCount) {
        isCorrect = false;
      }

      if (isCorrect) {
        this.correctAnswers++;
      }

      // Store user answer
      this.userAnswers.push({
        questionIndex: this.currentQuestionIndex,
        selectedAnswers: [...this.selectedAnswers],
        isCorrect: isCorrect,
      });
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.currentQuestion = this.questions[this.currentQuestionIndex];
        this.selectedAnswers = [];
        this.questionAnswered = false;

        // Check if this question was already answered
        const previousAnswer = this.userAnswers.find(
          (a) => a.questionIndex === this.currentQuestionIndex
        );
        if (previousAnswer) {
          this.selectedAnswers = previousAnswer.selectedAnswers;
          this.questionAnswered = true;
        }
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.currentQuestion = this.questions[this.currentQuestionIndex];

        // Load previous answer if exists
        const previousAnswer = this.userAnswers.find(
          (a) => a.questionIndex === this.currentQuestionIndex
        );
        if (previousAnswer) {
          this.selectedAnswers = previousAnswer.selectedAnswers;
          this.questionAnswered = true;
        } else {
          this.selectedAnswers = [];
          this.questionAnswered = false;
        }
      }
    },

    showResults() {
      this.currentView = "results";
    },

    reviewAnswers() {
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.questions[0];
      const previousAnswer = this.userAnswers.find(
        (a) => a.questionIndex === 0
      );
      if (previousAnswer) {
        this.selectedAnswers = previousAnswer.selectedAnswers;
        this.questionAnswered = true;
      }
      this.currentView = "quiz";
    },

    resetQuiz() {
      this.currentView = "setup";
      this.selectedSource = "NI";
      this.testType = "30";
      this.questions = [];
      this.currentQuestionIndex = 0;
      this.currentQuestion = null;
      this.selectedAnswers = [];
      this.questionAnswered = false;
      this.correctAnswers = 0;
      this.answeredQuestions = 0;
      this.userAnswers = [];
    },

    // Helper method to check if a question has multiple correct answers
    hasMultipleCorrectAnswers() {
      if (!this.currentQuestion) return false;
      return this.currentQuestion.answers.filter((a) => a.correct).length > 1;
    },
  };
}
