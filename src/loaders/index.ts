import ProductService from '../services/ProductService';
import CategoryService from '../services/CategoryService';
import CartService from '../services/CartService';
import useAuthStore from '../store/auth';
import { Product, Category, Cart, User } from '../types/altogic';
import altogic from '../libs/altogic';

interface RootLoader {
	products: Product[];
	categories: Category[];
	activeCategories: Category[];
	cart: Cart[];
}
export async function rootLoader() {
	const products = ProductService.getProducts();
	const activeCategories = CategoryService.getActiveCategories();
	const categories = CategoryService.getCategories();

	const data: RootLoader = {
		products: await products,
		categories: await categories,
		activeCategories: await activeCategories,
		cart: []
	};
	const { user, logout, setUser } = useAuthStore.getState();
	if (user) {
		data.cart = await CartService.getCart();
		const { user: userFromDB, errors } = await altogic.auth.getUserFromDB();
		if (!userFromDB || errors) logout();
		setUser(userFromDB as User);
	}

	return data;
}
