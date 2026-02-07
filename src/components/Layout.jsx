import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ children }) {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    if (isAuthPage) {
        return <div className="app">{children}</div>;
    }

    return (
        <div className="app">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;
