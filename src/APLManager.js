const APL = require("constants/APL");
const { GAME_LENGTH } = require("gameManager");

const questionResultsDataSource = require("apl/data/QuestionResultsDatasource");
const questionResultsDocument = require("apl/document/QuestionResultsDocument");

const gameResultsDataSource = require("apl/data/GameResultsDatasource");
const gameResultsDocument = require("apl/document/GameResultsDocument");

const launchSkillDocument = require("apl/document/LaunchSkillDocument");

const questionAndAnswersDataSource = require("apl/data/QuestionAndAnswersDatasource");
const questionAndAnswersDocument = require("apl/document/QuestionAndAnswersDocument");
const { NEXT_QUESTION_USER_GENERATED_EVENT, NEW_GAME_USER_GENERATED_EVENT } = require("./constants/APL");

const getQuestionAndAnswersViewDirective = (question, answers, sessionAttributes) => {
    // TODO Validate inputs
    const answerMetadata = [];
    for (var index = 0; index < answers.length; index++) {
        const answerMetadatum = {
            index: index + 1,
            answerText: answers[index],
        }
        answerMetadata.push(answerMetadatum);
    }

    const data = {
        answers: answerMetadata,
        question: question,
        sessionAttributes: sessionAttributes,
    };

    return {
        type: APL.APL_DOCUMENT_TYPE,
        version: APL.APL_DOCUMENT_VERSION,
        document: questionAndAnswersDocument,
        datasources: { questionAndAnswersDataSource: questionAndAnswersDataSource(data), },
    }
}

/**
 * Returns APL directives to be rendered at the end of the game declaring the game results.
 */
const getGameResultsViewDirectives = (isWon, sessionAttributes) => {
    const { incorrectAnswers, score, skippedAnswers } = sessionAttributes;
    return [{
        type: APL.APL_DOCUMENT_TYPE,
        version: APL.APL_DOCUMENT_VERSION,
        document: gameResultsDocument,
        datasources: {
            gameResultsDataSource: gameResultsDataSource(
                isWon,
                incorrectAnswers,
                score,
                skippedAnswers,
                NEW_GAME_USER_GENERATED_EVENT,
                GAME_LENGTH,
            ),
        },
    },];
}

/**
 * Returns an APL directive to be rendered at skill launch.
 */
const getLaunchSkillViewDirectives = () => {
    return {
        type: APL.APL_DOCUMENT_TYPE,
        version: APL.APL_DOCUMENT_VERSION,
        document: launchSkillDocument,
    };
}

/**
 * Returns APL directives to be rendered after the user answers a question. 
 */
const getResultsViewDirective = (isCorrect, sessionAttributes) => {
    // TODO Validate inputs
    // TODO ask-sdk-test currently has no provision to test Alexa.Presentation.APL.ExecuteCommands. Report bug.    
    return [{
        type: APL.APL_DOCUMENT_TYPE,
        version: APL.APL_DOCUMENT_VERSION,
        token: APL.RESULTS_VIEW_TOKEN,
        document: questionResultsDocument,
        datasources: {
            questionResultsDataSource: questionResultsDataSource(
                isCorrect,
                sessionAttributes,
                GAME_LENGTH,
                NEXT_QUESTION_USER_GENERATED_EVENT,
            ),
        },
    },
    {
        type: APL.APL_COMMANDS_TYPE,
        token: APL.RESULTS_VIEW_TOKEN,
        commands: [{
            type: "SendEvent",
            arguments: [
                APL.NEXT_QUESTION_AUTO_GENERATED_EVENT,
                sessionAttributes,
            ]
        }],
    }]
}

module.exports = {
    getGameResultsViewDirectives: getGameResultsViewDirectives,
    getLaunchSkillViewDirectives: getLaunchSkillViewDirectives,
    getQuestionAndAnswersViewDirective: getQuestionAndAnswersViewDirective,
    getResultsViewDirective: getResultsViewDirective,
};