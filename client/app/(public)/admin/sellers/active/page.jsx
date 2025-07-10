'use client'
export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api/admin';
import { 
  RefreshCw, Search, ChevronDown, ChevronUp,
  Edit3, Camera, Upload, Save, X, Globe,
  Twitter, Linkedin, Instagram, Mail, MapPin,
  UserCheck, Users, DollarSign,
  Calendar, Package, Star
} from 'lucide-react';

const ActiveSellersPage = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSellers, setExpandedSellers] = useState(new Set());
  const [editingSeller, setEditingSeller] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const fetchApprovedSellers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.sellers.getByStatus.fetch('approved', page, 30);
      if (response?.profiles) {
        setSellers(response.profiles);
        setPagination(response.pagination || {});
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setSellers([]);
      }
    } catch (error) {
      toast.error('Failed to fetch approved sellers');
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedSellers();
  }, [page]);

  const enhancedSellers = sellers.map(seller => ({
    ...seller,
    stats: seller.stats || {
      totalProducts: 0,
      totalSales: 0,
      totalRevenue: 0,
      avgRating: 0,
      profileViews: 0
    },
    socialLinks: seller.socialLinks || {},
    joinedDate: seller.createdAt || seller.verification?.approvedAt || new Date().toISOString()
  }));

  const filteredSellers = sellers.filter(seller => {
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      seller.fullName?.toLowerCase().includes(query) ||
      seller.email?.toLowerCase().includes(query) ||
      seller.userId?.emailAddress?.toLowerCase().includes(query) ||
      seller.location?.country?.toLowerCase().includes(query) ||
      seller.niches?.some(niche => niche.toLowerCase().includes(query)) ||
      seller.toolsSpecialization?.some(tool => tool.toLowerCase().includes(query))
    );
  });

  const toggleSellerExpansion = (sellerId) => {
    const newExpanded = new Set(expandedSellers);
    if (newExpanded.has(sellerId)) {
      newExpanded.delete(sellerId);
    } else {
      newExpanded.add(sellerId);
    }
    setExpandedSellers(newExpanded);
  };

  const handleEditProfile = (seller) => {
    setEditingSeller({
      ...seller,
      bannerImage: null,
      profileImage: null
    });
    setShowEditModal(true);
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingSeller(prev => ({
          ...prev,
          [type]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // API call to update seller profile
      // await adminAPI.sellers.profile.update(editingSeller._id, editingSeller);
      toast.success('Profile updated successfully');
      setShowEditModal(false);
      setEditingSeller(null);
      fetchApprovedSellers();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleRefresh = () => {
    fetchApprovedSellers();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold font-league-spartan text-white">Active Sellers</h1>
            <p className="text-gray-400 font-kumbh-sans mt-1 text-lg">
              Manage active seller profiles {pagination.total && `(${pagination.total} total)`}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#252525] transition-colors font-kumbh-sans"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, location, niches, or tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <UserCheck className="w-8 h-8 text-[#00FF89]" />
            <span className="text-xs text-[#00FF89] uppercase tracking-wider font-medium">Active</span>
          </div>
          <p className="text-3xl font-bold text-white font-league-spartan">{pagination.total || enhancedSellers.length}</p>
          <p className="text-gray-400 text-sm font-kumbh-sans mt-1">Total Sellers</p>
        </div>

        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-8 h-8 text-[#00AFFF]" />
            <span className="text-xs text-[#00AFFF] uppercase tracking-wider font-medium">Products</span>
          </div>
          <p className="text-3xl font-bold text-white font-league-spartan">
            {enhancedSellers.reduce((sum, s) => sum + (s.stats?.totalProducts || 0), 0)}
          </p>
          <p className="text-gray-400 text-sm font-kumbh-sans mt-1">Total Listings</p>
        </div>

        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-[#FFC050]" />
            <span className="text-xs text-[#FFC050] uppercase tracking-wider font-medium">Revenue</span>
          </div>
          <p className="text-3xl font-bold text-white font-league-spartan">
            ${enhancedSellers.reduce((sum, s) => sum + (s.stats?.totalRevenue || 0), 0).toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm font-kumbh-sans mt-1">Total Generated</p>
        </div>

        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Star className="w-8 h-8 text-[#FFC050]" />
            <span className="text-xs text-[#FFC050] uppercase tracking-wider font-medium">Rating</span>
          </div>
          <p className="text-3xl font-bold text-white font-league-spartan">
            {enhancedSellers.length > 0 
              ? (enhancedSellers.reduce((sum, s) => sum + (s.stats?.avgRating || 0), 0) / enhancedSellers.length).toFixed(1)
              : '0.0'}
          </p>
          <p className="text-gray-400 text-sm font-kumbh-sans mt-1">Average Rating</p>
        </div>
      </div>

      {/* Search Results Count */}
      {searchQuery && (
        <div className="text-sm text-gray-400">
          Showing {filteredSellers.length} results for "{searchQuery}"
        </div>
      )}

      {/* Sellers List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#00FF89] border-t-transparent"></div>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white font-league-spartan">
            {searchQuery ? 'No sellers found matching your search' : 'No Active Sellers'}
          </h3>
          <p className="text-gray-400 font-kumbh-sans mt-2">
            {searchQuery ? 'Try adjusting your search criteria' : 'Active sellers will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSellers.map((seller) => {
            const isExpanded = expandedSellers.has(seller._id);

            return (
              <div
                key={seller._id}
                className="bg-[#1f1f1f] border border-gray-800 rounded-xl overflow-hidden transition-all duration-200"
              >
                {/* Collapsed View */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-[#00FF89]/20 rounded-full flex items-center justify-center text-[#00FF89] font-bold text-lg">
                        {seller.fullName?.charAt(0).toUpperCase()}
                      </div>

                      {/* Basic Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white font-league-spartan">
                            {seller.fullName}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full font-medium bg-[#00FF89]/20 text-[#00FF89]">
                            <UserCheck className="w-3 h-3" />
                            Active Seller
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {seller.email || seller.userId?.emailAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {seller.location?.country || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Joined {formatDate(seller.joinedDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProfile(seller);
                        }}
                        className="px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors text-sm flex items-center gap-1.5"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>

                      <button
                        onClick={() => toggleSellerExpansion(seller._id)}
                        className="p-2 bg-[#121212] text-gray-400 rounded-lg hover:bg-[#252525] transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded View */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-800">
                    <div className="pt-4 space-y-4">
                      {/* Bio */}
                      {seller.bio && (
                        <div className="bg-[#121212] rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Bio</p>
                          <p className="text-sm text-gray-300">{seller.bio}</p>
                        </div>
                      )}

                      {/* Links */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-[#121212] rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Website</p>
                          <a
                            href={seller.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#00FF89] hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            {seller.websiteUrl || 'No website'}
                          </a>
                        </div>
                        {seller.socialLinks?.twitter && (
                          <div className="bg-[#121212] rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Twitter</p>
                            <a
                              href={seller.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#00FF89] hover:underline flex items-center gap-1"
                            >
                              <Twitter className="w-3 h-3" />
                              Profile
                            </a>
                          </div>
                        )}
                        {seller.socialLinks?.linkedin && (
                          <div className="bg-[#121212] rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">LinkedIn</p>
                            <a
                              href={seller.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#00FF89] hover:underline flex items-center gap-1"
                            >
                              <Linkedin className="w-3 h-3" />
                              Profile
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-[#121212] rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Products</p>
                          <p className="text-lg font-semibold text-white">{seller.stats?.totalProducts || 0}</p>
                        </div>
                        <div className="bg-[#121212] rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Sales</p>
                          <p className="text-lg font-semibold text-white">{seller.stats?.totalSales || 0}</p>
                        </div>
                        <div className="bg-[#121212] rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Revenue</p>
                          <p className="text-lg font-semibold text-[#00FF89]">${seller.stats?.totalRevenue || 0}</p>
                        </div>
                        <div className="bg-[#121212] rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-[#FFC050] fill-current" />
                            <p className="text-lg font-semibold text-white">{seller.stats?.avgRating || '-'}</p>
                          </div>
                        </div>
                        <div className="bg-[#121212] rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Views</p>
                          <p className="text-lg font-semibold text-white">{seller.stats?.profileViews || 0}</p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="space-y-3">
                        {seller.niches && seller.niches.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Niches</p>
                            <div className="flex flex-wrap gap-2">
                              {seller.niches.map((niche, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-[#00FF89]/10 text-[#00FF89] text-xs rounded-lg"
                                >
                                  {niche}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {seller.toolsSpecialization && seller.toolsSpecialization.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Tools Specialization</p>
                            <div className="flex flex-wrap gap-2">
                              {seller.toolsSpecialization.map((tool, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-[#FFC050]/10 text-[#FFC050] text-xs rounded-lg"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !searchQuery && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[#1f1f1f] border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252525] transition-colors"
          >
            Previous
          </button>
          <span className="text-white px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-[#1f1f1f] border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252525] transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && editingSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1f1f1f] border-b border-gray-800 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white font-league-spartan">Edit Seller Profile</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSeller(null);
                }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Banner Image</label>
                <div
                  className="relative h-32 bg-[#121212] rounded-lg border-2 border-dashed border-gray-700 overflow-hidden cursor-pointer hover:border-gray-600 transition-colors"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {editingSeller.bannerImage ? (
                    <img src={editingSeller.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Upload className="w-8 h-8 text-gray-600 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload banner (1500x300px)</span>
                    </div>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'bannerImage')}
                  />
                </div>
              </div>

              {/* Profile Image */}
              <div className="flex items-start gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Profile Picture</label>
                  <div
                    className="relative w-24 h-24 bg-[#121212] rounded-full border-2 border-dashed border-gray-700 overflow-hidden cursor-pointer hover:border-gray-600 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {editingSeller.profileImage ? (
                      <img src={editingSeller.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Camera className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'profileImage')}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                  <textarea
                    value={editingSeller.bio || ''}
                    onChange={(e) => setEditingSeller(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 resize-none"
                    placeholder="Tell customers about your expertise..."
                  />
                </div>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400">Links & Social Media</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="url"
                      value={editingSeller.websiteUrl || ''}
                      onChange={(e) => setEditingSeller(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Twitter/X</label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={editingSeller.socialLinks?.twitter || ''}
                        onChange={(e) => setEditingSeller(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                        }))}
                        className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn</label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={editingSeller.socialLinks?.linkedin || ''}
                        onChange={(e) => setEditingSeller(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                        }))}
                        className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={editingSeller.socialLinks?.instagram || ''}
                        onChange={(e) => setEditingSeller(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                        }))}
                        className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSeller(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSellersPage;