/**
 * @type {import('openpgp')}
 */
var openpgp = window.openpgp;

const inputUsernameElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("input-username"));
const inputEmailElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("input-email"));
const inputPasswordElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("input-password"));

const outputPubkeyElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("output-pubkey"));
const outputPrivkeyElem = /** @type {HTMLTextAreaElement} */ (document.getElementById("output-privkey"));

const update = async () => {
	const name = inputUsernameElem.value;
	const email = inputEmailElem.value;
	const passphrase = inputPasswordElem.value ?? undefined;

	await openpgp
		.generateKey({
			userIDs: [{ name, email }],
			passphrase,
			format: "armored",
		})
		.then(({ privateKey, publicKey }) => {
			outputPubkeyElem.value = publicKey;
			outputPubkeyElem.rows = publicKey.split("\n").length;
			outputPrivkeyElem.value = privateKey;
			outputPrivkeyElem.rows = privateKey.split("\n").length;
		})
		.catch((e) => {
			outputPubkeyElem.value = `Error: ${e.message}`;
			outputPrivkeyElem.value = "";
		});
};

/**
 * @param {Event & { target: HTMLTextAreaElement }} evt
 */
const focusSelectCopy2 = ({target}) => {
	target.focus();
	target.select();
	navigator.clipboard.writeText(target.value);
};

inputUsernameElem.addEventListener("input", update);
inputEmailElem.addEventListener("input", update);
inputPasswordElem.addEventListener("input", update);

outputPrivkeyElem.addEventListener('click',focusSelectCopy2);
outputPubkeyElem.addEventListener('click',focusSelectCopy2);

update();
