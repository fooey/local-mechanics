'use strict';



/*
*	EXPORT
*/

module.exports = {
	arrayToArrayOfArays: arrayToArrayOfArays,
};




/*
*	PUBLIC
*/

function arrayToArrayOfArays(input, numArrays) {
	var total = input.length;
	var output = [];

	var perArray = Math.ceil(total / numArrays);

	for (var i = 0; i < total; i += perArray) {
		output.push(
			input.slice(i, i + perArray)
		);
	}

	return output;
}
