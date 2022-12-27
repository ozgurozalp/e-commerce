export { default as Orders } from './Orders';
export { default as AddOrUpdateProduct } from './AddOrUpdateProduct';
export { default as AddCategory } from './AddCategory';
export { default as OrderDetails } from './OrderDetails';
export { default as Products } from './Products';
export { default as Stats } from './Stats';
export { default as Categories } from './Categories';

import { Outlet } from 'react-router-dom';

export default function Index() {
	return <Outlet />;
}
