import { Link } from 'react-router-dom';
import { IoMdNotifications } from 'react-icons/io';
import { MdPerson } from 'react-icons/md';

function Header() {
    return (
        <div className="app-header">
            <div className="header-spacer"></div>
            <div className="header-actions">
                <div className="notification-icon">
                    <IoMdNotifications size={24} color="#666" />
                    <span className="notification-badge">3</span>
                </div>

                <Link to="/profile" className="user-avatar-link">
                    <div className="user-avatar-icon">
                        <MdPerson size={28} />
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default Header;
