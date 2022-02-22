const script = `
/**
 * Called before formula fields are evaluated
 *
 * @param {QuoteLineModel[]} quoteLineModels
 * @param {import("jsforce").Connection} conn optional
 */
export function onInit(quoteLineModels, conn) {
	// should return promise (can be async function)
}

/**
 * Called before calculation, but after formula fields evaluation
 *
 * @param {QuoteModel} quoteModel
 * @param {QuoteLineModel[]} quoteLineModels
 * @param {import("jsforce").Connection} conn optional
 */
export function onBeforeCalculate(quoteModel, quoteLineModels, conn) {
	// should return promise (can be async function)
}

/**
 * Called after calculation, but before formula fields evaluation
 *
 * @param {QuoteModel} quoteModel
 * @param {QuoteLineModel[]} quoteLineModels
 * @param {import("jsforce").Connection} conn optional
 */
export function onAfterCalculate(quoteModel, quoteLineModels, conn) {
	// should return promise (can be async function)
}
/**
 * Called before price riles evaluation
 *
 * @param {QuoteModel} quoteModel
 * @param {QuoteLineModel[]} quoteLineModels
 * @param {import("jsforce").Connection} conn optional
 */
export function onBeforePriceRules(quoteModel, quoteLineModels, conn) {
	// should return promise (can be async function)
}

/**
 * Called before price riles evaluation
 *
 * @param {QuoteModel} quoteModel
 * @param {QuoteLineModel[]} quoteLineModels
 * @param {import("jsforce").Connection} conn optional
 */
export function onAfterPriceRules(quoteModel, quoteLineModels, conn) {
	// should return promise (can be async function)
}

/**
 * Defines if field is visible in calculator.
 * Called after calculations.
 * **Can't be used for data manipulation!**
 *
 * @param {string} fieldName
 * @param quoteLineModelRecord quote line record
 * @return {boolean}
 */
export function isFieldVisible(fieldName, quoteLineModelRecord) {
	return true;
}

/**
 * Defines if field is editable in calculator.
 * Called after calculations.
 * **Can't be used for data manipulation!**
 *
 * @param {string} fieldName
 * @param quoteLineModelRecord quote line record
 * @return {boolean}
 */
export function isEditableVisible(fieldName, quoteLineModelRecord) {
	return true;
}
`;
export default script;
