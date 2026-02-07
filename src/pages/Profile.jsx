import { useState } from 'react'
import { MdLocationOn, MdSchool, MdWork, MdLanguage, MdEmail, MdWeb, MdVerified, MdMessage } from 'react-icons/md'

function Profile() {
  const [isFollowing, setIsFollowing] = useState(false)

  const profileData = {
    name: 'Gaston Lapierre',
    title: 'Project Head Manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop',
    isVerified: true,
    stats: {
      experience: { value: '3+', label: 'Years Job Experience' },
      certificates: { value: '5', label: 'Certificate Achieved' },
      internships: { value: '2', label: 'Internship Completed' }
    },
    personalInfo: {
      jobTitle: 'Project Head Manager',
      education: 'Oxford International',
      location: 'Pittsburgh, PA 15212',
      followers: '16.6k People',
      email: 'hello@dundermufflin.com',
      website: 'www.larkon.co',
      languages: 'English, Spanish, German',
      status: 'Active'
    },
    about: `Gaston is a skilled Project Head Manager with over 3 years of experience in leading cross-functional teams and delivering complex projects on time and within budget. He has a proven track record of successfully managing multiple projects simultaneously while maintaining high quality standards.

    With his educational background from Oxford International and extensive experience in project management, Gaston brings a unique blend of academic knowledge and practical expertise to every project he undertakes.`
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">PROFILE</h1>
        </div>
      </div>

      <div className="profile-container">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-cover">
            <img src={profileData.coverImage} alt="Cover" className="cover-image" />
          </div>
          
          <div className="profile-header-content">
            <div className="profile-avatar">
              <img src={profileData.avatar} alt={profileData.name} className="avatar-image" />
            </div>
            
            <div className="profile-info">
              <div className="profile-name-section">
                <h2 className="profile-name">
                  {profileData.name}
                  {profileData.isVerified && <MdVerified className="verified-icon" />}
                </h2>
                <p className="profile-title">{profileData.title}</p>
              </div>
              
              <div className="profile-actions">
                <button className="btn btn-primary profile-btn">
                  <MdMessage size={16} />
                  Message
                </button>
                <button 
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-outline'} profile-btn`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? 'Following' : '+ Follow'}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-icon experience">
                <MdWork size={20} />
              </div>
              <div className="stat-details">
                <div className="stat-number">{profileData.stats.experience.value}</div>
                <div className="stat-label">{profileData.stats.experience.label}</div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon certificates">
                <MdSchool size={20} />
              </div>
              <div className="stat-details">
                <div className="stat-number">{profileData.stats.certificates.value}</div>
                <div className="stat-label">{profileData.stats.certificates.label}</div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon internships">
                <MdWork size={20} />
              </div>
              <div className="stat-details">
                <div className="stat-number">{profileData.stats.internships.value}</div>
                <div className="stat-label">{profileData.stats.internships.label}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Personal Information */}
          <div className="content-card">
            <h3>Personal Information</h3>
            
            <div className="info-grid">
              <div className="info-item">
                <MdWork className="info-icon" />
                <span className="info-label">{profileData.personalInfo.jobTitle}</span>
              </div>
              
              <div className="info-item">
                <MdSchool className="info-icon" />
                <span className="info-label">Went to <strong>{profileData.personalInfo.education}</strong></span>
              </div>
              
              <div className="info-item">
                <MdLocationOn className="info-icon" />
                <span className="info-label">Lives in <strong>{profileData.personalInfo.location}</strong></span>
              </div>
              
              <div className="info-item">
                <MdWork className="info-icon" />
                <span className="info-label">Followed by <strong>{profileData.personalInfo.followers}</strong></span>
              </div>
              
              <div className="info-item">
                <MdEmail className="info-icon" />
                <span className="info-label">Email</span>
                <a href={`mailto:${profileData.personalInfo.email}`} className="info-link">
                  {profileData.personalInfo.email}
                </a>
              </div>
              
              <div className="info-item">
                <MdWeb className="info-icon" />
                <span className="info-label">Website</span>
                <a href={`https://${profileData.personalInfo.website}`} className="info-link" target="_blank" rel="noopener noreferrer">
                  {profileData.personalInfo.website}
                </a>
              </div>
              
              <div className="info-item">
                <MdLanguage className="info-icon" />
                <span className="info-label">Language <strong>{profileData.personalInfo.languages}</strong></span>
              </div>
              
              <div className="info-item">
                <div className="status-indicator active"></div>
                <span className="info-label">Status</span>
                <span className="status-badge active">{profileData.personalInfo.status}</span>
              </div>
            </div>
            
            <div className="view-more">
              <button className="view-more-btn">View More</button>
            </div>
          </div>

          {/* About Section */}
          <div className="content-card">
            <h3>About</h3>
            <div className="about-content">
              {profileData.about.split('\n\n').map((paragraph, index) => (
                <p key={index} className="about-paragraph">{paragraph.trim()}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

