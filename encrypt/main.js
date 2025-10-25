/**
 * @type {import('openpgp')}
 */
var openpgp = window.openpgp;

const inputPubkeyElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("input-pubkey"));
const inputPubkeyInfoElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("input-pubkey-info"));
const inputMessageElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("input-message"));
const outputCipherElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("output-cipher"));

const reconcile = async () => {
	const armoredKey = inputPubkeyElem.value;
	const text = inputMessageElem.value;

	const textLength = text.split("\n").length;
	inputMessageElem.rows = textLength > 5 ? textLength : 5;

	await Promise.all([openpgp.readKey({ armoredKey }), openpgp.createMessage({ text })])
		.then(([encryptionKeys, message]) => {
			inputPubkeyInfoElem.value = encryptionKeys.users.map((u) => `UserID: ${u.userID.userID}`).join("\n");
			inputPubkeyInfoElem.rows = encryptionKeys.users.length;
			return openpgp.encrypt({ message, encryptionKeys });
		})
		.then((cipher) => {
			outputCipherElem.rows = text !== "" ? cipher.split("\n").length : 5;
			outputCipherElem.value = text !== "" ? cipher : "";
		})
		.catch((e) => {
			inputPubkeyInfoElem.value = "";
			outputCipherElem.value = armoredKey !== "" ? `Error: ${e.message}` : "";
		});
};

/**
 * @param {Event & { target: HTMLTextAreaElement }} evt
 */
const focusSelect = ({ target }) => {
	target.focus();
	target.select();
};

/**
 * @param {Event & { target: HTMLTextAreaElement }} evt
 */
const focusSelectCopy = (evt) => {
	focusSelect(evt);
	navigator.clipboard.writeText(evt.target.value);
};

inputPubkeyElem.addEventListener("input", reconcile);
inputMessageElem.addEventListener("input", reconcile);
inputPubkeyElem.addEventListener("click", focusSelect);
outputCipherElem.addEventListener("click", focusSelectCopy);

reconcile();
