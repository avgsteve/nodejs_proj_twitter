function DisplayCurrentFunctionName() {

	// return console.log(DisplayCurrentFunctionName.caller);
	// return console.log(
	// 	DisplayCurrentFunctionName.caller
	// );

	return console.log(`Calling file: ${caller.name}` + Object.keys(this.process));



	// return console.log(global.process.mainModule.filename);

}

//ref: https://stackoverflow.com/questions/1013239/can-i-get-the-name-of-the-currently-running-function-in-javascript

module.exports = DisplayCurrentFunctionName;