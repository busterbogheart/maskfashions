
// parses an AdButler/json schema, holds it as the authority
// returns a version of the schema with values removed based on available products/ads, to avoid "0 results" sadness
export default class FilterSchema {
	#masterSchema = [];
	#masterCategories = {};
	#filteredSchema = {};
	#keywords = [];

	constructor(schema) {
		this.#masterSchema = this.createSchema(schema, true);

		for (let filter of this.#masterSchema) {
			let childrenArr = (filter.type == 'toggle') ? ['yes'] : [];
			// children:  [{name:'',id:''}, {name:''}]
			for (const el of filter.children) {
				childrenArr.push(el.name);
			}
			this.#masterCategories[filter.name] = childrenArr;
		}
	}

	// converts AdButler format to multi select format
	// { 'name': ['v','a','ls'], 'name': ['yes'], ... } to [ {'name': '', 'id':2, 'children': [{'name':'', 'id':1}, {}, ...] } ]
	createSchema = (schema, isMaster = false) => {
		let newSchema = [];

		let count = 0,type;
		for (const k in schema) {
			let childrenArr = [];
			// toggle vs multi option categories
			if (isMaster && schema[k].length == 1) {
				type = 'toggle';
			} else if (!isMaster && this.#masterCategories[k].length == 1) {
				type = 'toggle';
			} else {
				if (schema[k] != null) {
					for (const el of schema[k]) {
						childrenArr.push({name: el,id: `${count}-${el}`});
					}
				}
				type = 'category';
			}
			newSchema.push({
				name: k,
				id: count,
				type: type,
				children: childrenArr,
			});
			count++;
		}

		return newSchema;
	}


	// textureList is [{metadata: {cat:[], cat:[]},...}, {metadata:{},...}] 
	filterAndReturnFilteredSchema = (textureList) => {
		let temp = {};
		// need  { 'name': ['v','a','ls'], 'name': ['yes'], ... }
		// only display categories and values if they exist in ad items && are in the master schema
		for (let ad of textureList) {
			const meta = ad.metadata;
			// categories used by this ad item; colors, pattern, etc
			const categories = Object.keys(meta);
			categories.forEach((categoryName,i) => {
				// skip entered categories that don't exist
				if (!Object.keys(this.#masterCategories).includes(categoryName)) return;

				// check which children exist in master
				const valuesArr = meta[categoryName].split(',').map(str => str.trim());
				let toggleType = this.#masterCategories[categoryName].length == 1;
				let childrenArr = [];
				if (toggleType) {
					// if category exists, the option exists
					childrenArr = ['yes'];
				} else {
					for (const val of valuesArr) {
						if (this.#masterCategories[categoryName].includes(val)) {
							childrenArr.push(val);
						}
					}
				}
				//exists
				if ((categoryName in temp)) {
					let existing = temp[categoryName];
					temp[categoryName] = [...new Set([...childrenArr,...existing])];
					//new
				} else {
					temp[categoryName] = childrenArr;
				}
			});
		}
		this.#filteredSchema = this.createSchema(temp);

		return this.#filteredSchema;
	}


}