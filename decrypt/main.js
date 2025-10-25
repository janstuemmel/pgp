/**
 * @type {import('openpgp')}
 */
var openpgp = window.openpgp;

const inputPrivkeyElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("input-privkey"));
const inputCipherElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("input-cipher"));
const inputPassphraseElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("input-password"));

const outputCleartextElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("output-cleartext"));

const updateDecrypt = async () => {
	const armoredKey = inputPrivkeyElem.value;
	const armoredMessage = inputCipherElem.value;
	const passphrase = inputPassphraseElem.value ?? undefined;

	inputCipherElem.rows = inputCipherElem.value.split("\n").length;

	if (!armoredKey || !armoredMessage) {
		outputCleartextElem.value = "";
		return;
	}

	const readKey = openpgp
		.readPrivateKey({ armoredKey })
		.then((decryptionKeys) =>
			decryptionKeys.isDecrypted() ? decryptionKeys : openpgp.decryptKey({ privateKey: decryptionKeys, passphrase }),
		);

	await Promise.all([openpgp.readMessage({ armoredMessage }), readKey])
		.then(([message, decryptionKeys]) => openpgp.decrypt({ message, decryptionKeys }))
		.then(({ data }) => {
			outputCleartextElem.value = data;
			outputCleartextElem.rows = data.split("\n").length > 5 ? data.split("\n").length : 5;
		})
		.catch((e) => {
			outputCleartextElem.value = `Error: ${e.message}`;
		});
};

const focusSelectDecrypt = ({ target }) => {
	target.focus();
	target.select();
};

inputCipherElem.addEventListener("input", updateDecrypt);
inputPrivkeyElem.addEventListener("input", updateDecrypt);
inputPassphraseElem.addEventListener("input", updateDecrypt);

inputCipherElem.addEventListener("click", focusSelectDecrypt);
inputPrivkeyElem.addEventListener("click", focusSelectDecrypt);

updateDecrypt();
