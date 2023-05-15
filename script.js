async function loaded(reader) {
	const image = new Image();
	image.src = reader.result;

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.width = image.width;
	canvas.height = image.height;
	ctx.drawImage(image, 0, 0);

	// Resize the image to a smaller size
	const MAX_WIDTH = 256;
	const MAX_HEIGHT = 256;
	let width = image.width;
	let height = image.height;

	if (width > height) {
		if (width > MAX_WIDTH) {
			height *= MAX_WIDTH / width;
			width = MAX_WIDTH;
		}
	} else {
		if (height > MAX_HEIGHT) {
			width *= MAX_HEIGHT / height;
			height = MAX_HEIGHT;
		}
	}

	canvas.width = width;
	canvas.height = height;

	const resizeCtx = canvas.getContext('2d');
	resizeCtx.drawImage(image, 0, 0, width, height);

	const dataURL = canvas.toDataURL('image/jpeg', 0.9);

	const response = await fetch('https://hf.space/embed/JawdinMorris/catdog/+/api/predict/', {
		method: "POST", body: JSON.stringify({ "data": [dataURL] }),
		headers: { "Content-Type": "application/json" }
	});
	const json = await response.json();
	console.log(json)
	let label = json['data'][0]['confidences'][0]['label'];
	if (label == "puppy") {
		label = "dog"
	}
	const confidence = json['data'][0]['confidences'][0]['confidence'] * 100;
	if (confidence < 70) {
		results.innerHTML = `<h2>I can't figure this out. </h2>`;
	} else {
		results.innerHTML = `<h2> We think this photo is of a...</h2> <p class="prediction">${label} with ${confidence.toFixed(2)}% confidence</p><img src="${dataURL}" width="128">`
	}

}

function read() {
	if (photo.files && photo.files[0]) {
		const reader = new FileReader();

		reader.addEventListener('load', () => loaded(reader))
		reader.readAsDataURL(photo.files[0]);
	} else {
		// Handle the case where the file was not uploaded correctly
		console.error('No file uploaded');
	}
}
function submitForm() {
	const results = document.getElementById('results');
	results.innerHTML = `<h2>We're thinking...</h2>`;
	read();
}
photo.addEventListener('input', read);
submit.addEventListener('click', submitForm);