import altogic, { altogicOnlyRead } from '../libs/altogic';
import { Category, Product } from '../types/altogic';
import { APIError } from 'altogic';
import useCategoryStore from '../store/category';
import category from '../store/category';
import { th, tr } from 'date-fns/locale';

export default class ProductService {
	static async getProducts() {
		const { data, errors } = await altogicOnlyRead.db
			.model('products')
			.filter('qtyInStock > 0')
			.sort('createdAt', 'desc')
			.lookup({ field: 'category' })
			.get();

		if (errors) throw errors;

		return data as Product[];
	}

	static async getProductsByCategory(slug: string) {
		const { data, errors } = await altogicOnlyRead.db
			.model('products')
			.sort('createdAt', 'desc')
			.filter(`qtyInStock > 0 && category.slug == '${slug}'`)
			.lookup({ field: 'category' })
			.get();

		if (errors) throw errors;

		return data as Product[];
	}

	static async getProductById(_id: string) {
		const { data, errors } = await altogicOnlyRead.db.model('products').object(_id).get();

		if (errors) throw errors;

		return data as Product;
	}

	static async addProduct(product: AddProduct, image: File) {
		const { errors: uploadErrors, data } = await ProductService.uploadCoverImage(image);

		if (uploadErrors) throw uploadErrors;

		const { data: dataFromDB, errors } = (await altogic.endpoint.post('/products', {
			...product,
			coverURL: data.publicPath
		})) as {
			data: Product;
			errors: APIError;
		};

		if (errors) throw errors;

		dataFromDB.category = useCategoryStore
			.getState()
			.categories.find(category => category._id === product.category) as Category;

		return dataFromDB as Product;
	}

	static async uploadCoverImage(file: File) {
		let { data, errors } = (await altogic.storage.root.upload(file.name, file, {
			isPublic: true,
			onProgress() {} // suppress for ts error
		})) as {
			data: {
				publicPath: string;
			};
			errors: APIError;
		};

		return {
			errors,
			data
		};
	}

	static async updateProfile(id: string, data: Partial<Product>) {
		const { data: dataFromApi, errors } = await altogic.endpoint.put('/products/' + id, data);
		if (errors) throw errors;

		return dataFromApi as Product;
	}

	static async deleteProduct(id: string) {
		const { errors } = await altogic.db.model('products').object(id).delete();

		if (errors) throw errors;

		return true;
	}
}

interface AddProduct {
	name: string;
	qtyInStock: number;
	category: string;
	description: string;
	price: number;
}
