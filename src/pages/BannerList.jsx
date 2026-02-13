import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MdAdd,
    MdSearch,
    MdEdit,
    MdDelete,
    MdVisibility,
    MdVisibilityOff,
    MdContentCopy,
    MdTrendingUp,
    MdImage,
    MdSchedule,
    MdLocationOn,
    MdPeople,
    MdBarChart
} from 'react-icons/md';
import bannerService from '../api/bannerService';

function BannerList() {
    const [banners, setBanners] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        status: '',
        placement: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [retryCount, setRetryCount] = useState(0);
    const [serverStatsUnavailable, setServerStatsUnavailable] = useState(true);

    useEffect(() => {
        fetchBanners();
        if (!serverStatsUnavailable) {
            fetchStats();
        }
    }, [filters]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await bannerService.getAll(filters);
            let bannersData = [];

            if (Array.isArray(response)) {
                bannersData = response;
                setBanners(response);
                setPagination({ current: 1, total: 1, pages: 1 });
            } else {
                bannersData = response.data || response.banners || [];
                setBanners(bannersData);
                setPagination(response.pagination || { current: 1, total: 1, pages: 1 });
            }

            if (serverStatsUnavailable) {
                const calculatedStats = {
                    overview: {
                        total: bannersData.length,
                        active: bannersData.filter(banner => (typeof banner.status === 'object' ? banner.status?.name || banner.status?.value : banner.status) === 'active').length,
                        inactive: bannersData.filter(banner => (typeof banner.status === 'object' ? banner.status?.name || banner.status?.value : banner.status) === 'inactive').length,
                        scheduled: bannersData.filter(banner => (typeof banner.status === 'object' ? banner.status?.name || banner.status?.value : banner.status) === 'scheduled').length,
                        totalImpressions: bannersData.reduce((sum, banner) => sum + (banner.impressions || 0), 0),
                        totalClicks: bannersData.reduce((sum, banner) => sum + (banner.clicks || 0), 0),
                        averageClickRate: bannersData.length > 0 ? (bannersData.reduce((sum, banner) => sum + (banner.clickRate || 0), 0) / bannersData.length).toFixed(1) : 0
                    },
                    isCalculated: true
                };
                setStats(calculatedStats);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);

            if (error.message?.includes('500')) {
                setError('Server is temporarily unavailable. Please try again later.');
            } else if (error.message?.includes('404')) {
                setError('Banner management service not found. Please contact support.');
            } else if (error.message?.includes('Network Error')) {
                setError('Network connection error. Please check your internet connection.');
            } else {
                setError(error.message || 'Failed to load banners from server');
            }

            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStatsFromBanners = () => {
        if (!banners || banners.length === 0) {
            return {
                overview: {
                    total: 0,
                    active: 0,
                    inactive: 0,
                    scheduled: 0,
                    totalImpressions: 0,
                    totalClicks: 0,
                    averageClickRate: 0
                },
                isCalculated: true
            };
        }

        return {
            overview: {
                total: banners.length,
                active: banners.filter(banner => (typeof banner.status === 'object' ? banner.status?.name || banner.status?.value : banner.status) === 'active').length,
                inactive: banners.filter(banner => (typeof banner.status === 'object' ? banner.status?.name || banner.status?.value : banner.status) === 'inactive').length,
                scheduled: banners.filter(banner => (typeof banner.status === 'object' ? banner.status?.name || banner.status?.value : banner.status) === 'scheduled').length,
                totalImpressions: banners.reduce((sum, banner) => sum + (banner.impressions || 0), 0),
                totalClicks: banners.reduce((sum, banner) => sum + (banner.clicks || 0), 0),
                averageClickRate: banners.length > 0 ? (banners.reduce((sum, banner) => sum + (banner.clickRate || 0), 0) / banners.length).toFixed(1) : 0
            },
            isCalculated: true
        };
    };

    const fetchStats = async (forceServerAttempt = false) => {
        if (serverStatsUnavailable && !forceServerAttempt) {
            setStats(calculateStatsFromBanners());
            return;
        }

        try {
            const response = await bannerService.getStats();
            setStats(response.data || response);

            setServerStatsUnavailable(false);
        } catch (error) {

            if (forceServerAttempt) {
                console.warn('Banner stats API unavailable, calculating from client data:', error.message);
            }

            setServerStatsUnavailable(true);

            setStats(calculateStatsFromBanners());
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value
        }));
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            setError('');
            await bannerService.toggleStatus(id);
            await fetchBanners();
            await fetchStats();
        } catch (error) {
            console.error('Error toggling banner status:', error);
            if (error.message?.includes('500')) {
                setError('Server error: Unable to update banner status. Please try again later.');
            } else {
                setError(error.message || 'Failed to update banner status');
            }
        }
    };

    const handleDuplicate = async (id) => {
        try {
            setError('');
            await bannerService.duplicate(id);
            await fetchBanners();
        } catch (error) {
            console.error('Error duplicating banner:', error);
            if (error.message?.includes('500')) {
                setError('Server error: Unable to duplicate banner. Please try again later.');
            } else {
                setError(error.message || 'Failed to duplicate banner');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                setError('');
                await bannerService.delete(id);
                await fetchBanners();
                await fetchStats();
            } catch (error) {
                console.error('Error deleting banner:', error);
                if (error.message?.includes('500')) {
                    setError('Server error: Unable to delete banner. Please try again later.');
                } else {
                    setError(error.message || 'Failed to delete banner');
                }
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'status-success';
            case 'inactive': return 'status-secondary';
            case 'scheduled': return 'status-info';
            case 'expired': return 'status-danger';
            default: return 'status-default';
        }
    };

    const getPlacementLabel = (placement) => {
        const placements = {
            'homepage-hero': 'Homepage Hero',
            'homepage-sidebar': 'Homepage Sidebar',
            'product-page-sidebar': 'Product Page Sidebar',
            'category-page-header': 'Category Page Header',
            'checkout-page': 'Checkout Page',
            'cart-page': 'Cart Page',
            'search-results': 'Search Results'
        };
        return placements[placement] || placement;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-title-section">
                    <h1 className="page-title">
                        Banner Management
                    </h1>
                    <p className="page-subtitle">Manage promotional banners and advertisements</p>
                </div>
                <div className="page-actions">
                    <Link to="/banners/create" className="btn btn-primary">
                        <MdAdd size={20} />
                        Create Banner
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="stats-icon total">
                        <MdImage size={24} />
                    </div>
                    <div className="stats-content">
                        <h3>{stats.overview?.total || 0}</h3>
                        <p>Total Banners</p>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-icon active">
                        <MdVisibility size={24} />
                    </div>
                    <div className="stats-content">
                        <h3>{stats.overview?.active || 0}</h3>
                        <p>Active Banners</p>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-icon impressions">
                        <MdBarChart size={24} />
                    </div>
                    <div className="stats-content">
                        <h3>{formatNumber(stats.overview?.totalImpressions || 0)}</h3>
                        <p>Total Impressions</p>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-icon clicks">
                        <MdTrendingUp size={24} />
                    </div>
                    <div className="stats-content">
                        <h3>{formatNumber(stats.overview?.totalClicks || 0)}</h3>
                        <p>Total Clicks</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="content-card">
                <div className="filters-section">
                    <div className="search-box">
                        <MdSearch size={20} />
                        <input
                            type="text"
                            placeholder="Search banners..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="expired">Expired</option>
                        </select>

                        <select
                            value={filters.placement}
                            onChange={(e) => handleFilterChange('placement', e.target.value)}
                        >
                            <option value="">All Placements</option>
                            <option value="homepage-hero">Homepage Hero</option>
                            <option value="homepage-sidebar">Homepage Sidebar</option>
                            <option value="product-page-sidebar">Product Page Sidebar</option>
                            <option value="category-page-header">Category Page Header</option>
                            <option value="checkout-page">Checkout Page</option>
                            <option value="cart-page">Cart Page</option>
                            <option value="search-results">Search Results</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                                setRetryCount(prev => prev + 1);
                                fetchBanners();
                                fetchStats(true);
                            }}
                            style={{ marginLeft: '10px' }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="content-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p>Loading banners...</p>
                    </div>
                ) : (
                    <>
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Banner</th>
                                        <th>Placement</th>
                                        <th>Target Audience</th>
                                        <th>Status</th>
                                        <th>Schedule</th>
                                        <th>Performance</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(banners || []).map((banner) => (
                                        <tr key={banner._id}>
                                            <td>
                                                <div className="banner-info">
                                                    <img
                                                        src={banner.imageUrl || 'https://via.placeholder.com/60x30'}
                                                        alt={banner.title}
                                                        className="banner-thumbnail"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/60x30?text=Banner';
                                                        }}
                                                    />
                                                    <div className="banner-details">
                                                        <strong className="banner-title">{typeof banner.title === 'object' ? banner.title?.name || banner.title?.value || 'N/A' : (banner.title || 'N/A')}</strong>
                                                        <p className="banner-description">{typeof banner.description === 'object' ? banner.description?.text || banner.description?.content || 'N/A' : (banner.description || 'N/A')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="placement-info">
                                                    <MdLocationOn size={16} className="placement-icon" />
                                                    <span>{getPlacementLabel(typeof banner.placement === 'object' ? banner.placement?.name || banner.placement?.value : banner.placement)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="audience-info">
                                                    <MdPeople size={16} className="audience-icon" />
                                                    <span>{typeof banner.targetAudience === 'object' ? banner.targetAudience?.name || banner.targetAudience?.value || 'All Users' : (banner.targetAudience || 'All Users')}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusColor(typeof banner.status === 'object' ? banner.status?.name || banner.status?.value : banner.status)}`}>
                                                    {typeof banner.status === 'object' ? banner.status?.name || banner.status?.value || 'N/A' : (banner.status || 'N/A')}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="schedule-info">
                                                    <div className="date-range">
                                                        <MdSchedule size={14} />
                                                        <span>{formatDate(banner.startDate)} - {formatDate(banner.endDate)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="performance-metrics">
                                                    <div className="metric">
                                                        <span className="metric-value">{formatNumber(banner.impressions||0)}</span>
                                                        <span className="metric-label">views</span>
                                                    </div>
                                                    <div className="metric">
                                                        <span className="metric-value">{formatNumber(banner.clicks||0)}</span>
                                                        <span className="metric-label">clicks</span>
                                                    </div>
                                                    <div className="metric">
                                                        <span className="metric-value">{banner.clickRate||0}%</span>
                                                        <span className="metric-label">CTR</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => handleToggleStatus(banner._id, banner.status)}
                                                        className="action-btn view"
                                                        title={banner.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {banner.status === 'Active'
                                                            ? <MdVisibilityOff size={16} />
                                                            : <MdVisibility size={16} />
                                                        }
                                                    </button>
                                                    <Link
                                                        to={`/banners/${banner._id}/edit`}
                                                        className="action-btn edit"
                                                        title="Edit Banner"
                                                    >
                                                        <MdEdit size={16} />
                                                    </Link>
                                                    {/* <button
                                                        onClick={() => handleDuplicate(banner._id)}
                                                        className="action-btn view"
                                                        title="Duplicate Banner"
                                                    >
                                                        <MdContentCopy size={16} />
                                                    </button> */}
                                                    <button
                                                        onClick={() => handleDelete(banner._id)}
                                                        className="action-btn delete"
                                                        title="Delete Banner"
                                                    >
                                                        <MdDelete size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination?.total > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-sm"
                                    disabled={pagination.current === 1}
                                    onClick={() => handleFilterChange('page', pagination.current - 1)}
                                >
                                    Previous
                                </button>

                                <span className="pagination-info">
                                    Page {pagination.current} of {pagination.total}
                                </span>

                                <button
                                    className="btn btn-sm"
                                    disabled={pagination.current === pagination.total}
                                    onClick={() => handleFilterChange('page', pagination.current + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stats-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    border: 1px solid #f0f0f0;
                }

                .stats-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .stats-icon.total { background-color: #74b9ff; }
                .stats-icon.active { background-color: #00b894; }
                .stats-icon.impressions { background-color: #ffc007; }
                .stats-icon.clicks { background-color: #e17055; }

                .stats-content h3 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #333;
                    margin: 0 0 4px 0;
                }

                .stats-content p {
                    color: #666;
                    font-size: 14px;
                    margin: 0;
                }

                .banner-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .banner-thumbnail {
                    width: 60px;
                    height: 30px;
                    border-radius: 4px;
                    object-fit: cover;
                    border: 1px solid #e9ecef;
                }

                .banner-details {
                    flex: 1;
                }

                .banner-title {
                    display: block;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 4px;
                }

                .banner-description {
                    font-size: 12px;
                    color: #666;
                    margin: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 200px;
                }

                .placement-info, .audience-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                }

                .placement-icon { color: #ffc007; }
                .audience-icon { color: #74b9ff; }

                .schedule-info .date-range {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #666;
                }

                .performance-metrics {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .metric {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                }

                .metric-value {
                    font-weight: 600;
                    color: #333;
                }

                .metric-label {
                    color: #666;
                }

                .status-success { background-color: #d4edda; color: #155724; }
                .status-info { background-color: #d1ecf1; color: #0c5460; }
                .status-secondary { background-color: #e2e3e5; color: #383d41; }
                .status-danger { background-color: #f8d7da; color: #721c24; }

                .action-buttons {
                    display: flex;
                    gap: 4px;
                }

                .filters-section {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 8px 12px;
                    min-width: 300px;
                }

                .search-box input {
                    border: none;
                    outline: none;
                    flex: 1;
                    font-size: 14px;
                }

                .filter-group {
                    display: flex;
                    gap: 12px;
                }

                .filter-group select {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    background: white;
                    font-size: 14px;
                    min-width: 150px;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                    }

                    .filters-section {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }

                    .search-box {
                        min-width: auto;
                    }

                    .filter-group {
                        flex-direction: column;
                    }

                    .banner-description {
                        max-width: 120px;
                    }
                }

                @media (max-width: 480px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .action-buttons {
                        flex-direction: column;
                        gap: 2px;
                    }
                }
            `}</style>
        </div>
    );
}

export default BannerList;
