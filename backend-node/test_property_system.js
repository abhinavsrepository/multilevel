/**
 * Property System Test Suite
 *
 * Tests all property CRUD operations for both admin and user endpoints
 *
 * Usage:
 *   node test_property_system.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api/v1';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ecogram.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

let adminToken = null;
let testPropertyId = null;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Helper functions
const log = {
    info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.bright}${colors.blue}═══ ${msg} ═══${colors.reset}\n`)
};

// Test data
const sampleProperty = {
    propertyId: `TEST-${Date.now()}`,
    title: 'Luxury Beachfront Villa - Test Property',
    description: 'A stunning beachfront villa with panoramic ocean views. This is a test property created by the automated test suite.',
    propertyType: 'VILLA',
    propertyCategory: 'PREMIUM',
    address: '123 Beach Road, Seaside Colony',
    city: 'Goa',
    state: 'Goa',
    pincode: '403001',
    latitude: 15.2993,
    longitude: 74.1240,
    googleMapsLink: 'https://maps.google.com/?q=15.2993,74.1240',
    totalArea: 2500,
    builtUpArea: 2000,
    bedrooms: 4,
    bathrooms: 4,
    floors: 2,
    facing: 'NORTH',
    furnishingStatus: 'FULLY_FURNISHED',
    basePrice: 5000000,
    investmentPrice: 500000,
    minimumInvestment: 50000,
    totalInvestmentSlots: 100,
    directReferralCommissionPercent: 10,
    bvValue: 1000,
    expectedRoiPercent: 12,
    roiTenureMonths: 24,
    appreciationRateAnnual: 8,
    developerName: 'Prestige Developers',
    developerContact: '+91-9876543210',
    developerEmail: 'contact@prestigedev.com',
    reraNumber: 'RERA/GOA/2024/12345',
    amenities: ['Swimming Pool', 'Gym', 'Garden', 'Security', 'Parking'],
    images: [
        { url: 'https://via.placeholder.com/1200x800/0066cc/ffffff?text=Villa+Front+View', featured: true },
        { url: 'https://via.placeholder.com/1200x800/0099cc/ffffff?text=Living+Room', featured: false }
    ],
    videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    virtualTourUrl: 'https://example.com/tour/villa-123',
    documents: [
        { type: 'RERA_CERTIFICATE', name: 'RERA Certificate', url: 'https://example.com/docs/rera.pdf' }
    ],
    status: 'ACTIVE',
    isFeatured: true,
    isNewLaunch: true
};

// API client
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
});

// Tests
async function test1_AdminLogin() {
    log.section('TEST 1: Admin Login');

    try {
        const response = await api.post('/auth/login', {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        if (response.data.success && response.data.data.token) {
            adminToken = response.data.data.token;
            log.success('Admin login successful');
            log.info(`Token: ${adminToken.substring(0, 20)}...`);
            log.info(`Admin: ${response.data.data.user.fullName} (${response.data.data.user.role})`);
            return true;
        } else {
            log.error('Login failed: No token received');
            return false;
        }
    } catch (error) {
        log.error(`Login failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test2_CreateProperty() {
    log.section('TEST 2: Create Property (Admin)');

    try {
        const response = await api.post('/admin/properties', sampleProperty);

        if (response.data.success && response.data.data) {
            testPropertyId = response.data.data.id;
            log.success('Property created successfully');
            log.info(`Property ID: ${testPropertyId}`);
            log.info(`Property Code: ${response.data.data.propertyId}`);
            log.info(`Title: ${response.data.data.title}`);
            log.info(`Status: ${response.data.data.status}`);
            log.info(`Featured: ${response.data.data.isFeatured}`);
            return true;
        } else {
            log.error('Property creation failed: No data received');
            return false;
        }
    } catch (error) {
        log.error(`Property creation failed: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach(err => log.error(`  - ${err}`));
        }
        return false;
    }
}

async function test3_GetAllProperties() {
    log.section('TEST 3: Get All Properties (Admin)');

    try {
        const response = await api.get('/admin/properties', {
            params: { page: 1, limit: 10 }
        });

        if (response.data.success && response.data.data) {
            const properties = response.data.data;
            const pagination = response.data.pagination;

            log.success(`Retrieved ${properties.length} properties`);
            log.info(`Total: ${pagination.total}`);
            log.info(`Page: ${pagination.page}/${pagination.pages}`);

            if (properties.length > 0) {
                log.info(`\nFirst property: ${properties[0].title}`);
            }
            return true;
        } else {
            log.error('Failed to retrieve properties');
            return false;
        }
    } catch (error) {
        log.error(`Failed to get properties: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test4_GetPropertyById() {
    log.section('TEST 4: Get Property by ID (Admin)');

    if (!testPropertyId) {
        log.error('No test property ID available');
        return false;
    }

    try {
        const response = await api.get(`/admin/properties/${testPropertyId}`);

        if (response.data.success && response.data.data) {
            const property = response.data.data;
            log.success('Property retrieved successfully');
            log.info(`ID: ${property.id}`);
            log.info(`Code: ${property.propertyId}`);
            log.info(`Title: ${property.title}`);
            log.info(`Price: ₹${property.basePrice.toLocaleString('en-IN')}`);
            log.info(`Slots: ${property.slotsBooked}/${property.totalInvestmentSlots}`);
            log.info(`Amenities: ${property.amenities?.length || 0}`);
            log.info(`Images: ${property.images?.length || 0}`);
            return true;
        } else {
            log.error('Failed to retrieve property');
            return false;
        }
    } catch (error) {
        log.error(`Failed to get property: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test5_UpdateProperty() {
    log.section('TEST 5: Update Property (Admin)');

    if (!testPropertyId) {
        log.error('No test property ID available');
        return false;
    }

    try {
        const updates = {
            title: 'Updated Luxury Beachfront Villa',
            basePrice: 5500000,
            expectedRoiPercent: 14,
            description: 'Updated description with enhanced features and amenities.'
        };

        const response = await api.put(`/admin/properties/${testPropertyId}`, updates);

        if (response.data.success && response.data.data) {
            const property = response.data.data;
            log.success('Property updated successfully');
            log.info(`New Title: ${property.title}`);
            log.info(`New Price: ₹${property.basePrice.toLocaleString('en-IN')}`);
            log.info(`New ROI: ${property.expectedRoiPercent}%`);
            return true;
        } else {
            log.error('Failed to update property');
            return false;
        }
    } catch (error) {
        log.error(`Failed to update property: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test6_ToggleFeaturedStatus() {
    log.section('TEST 6: Toggle Featured Status (Admin)');

    if (!testPropertyId) {
        log.error('No test property ID available');
        return false;
    }

    try {
        const response = await api.put(`/admin/properties/${testPropertyId}/toggle-featured`);

        if (response.data.success) {
            log.success('Featured status toggled successfully');
            log.info(response.data.message);
            return true;
        } else {
            log.error('Failed to toggle featured status');
            return false;
        }
    } catch (error) {
        log.error(`Failed to toggle featured: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test7_UpdatePropertyStatus() {
    log.section('TEST 7: Update Property Status (Admin)');

    if (!testPropertyId) {
        log.error('No test property ID available');
        return false;
    }

    try {
        const response = await api.put(`/admin/properties/${testPropertyId}/status`, {
            status: 'INACTIVE'
        });

        if (response.data.success) {
            log.success('Property status updated successfully');
            log.info(response.data.message);

            // Revert back to ACTIVE
            await api.put(`/admin/properties/${testPropertyId}/status`, { status: 'ACTIVE' });
            log.info('Reverted status back to ACTIVE');

            return true;
        } else {
            log.error('Failed to update status');
            return false;
        }
    } catch (error) {
        log.error(`Failed to update status: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test8_UserGetAllProperties() {
    log.section('TEST 8: Get All Properties (User - Public)');

    try {
        // Remove token for public access
        const tempToken = adminToken;
        adminToken = null;

        const response = await api.get('/properties', {
            params: { page: 1, limit: 10 }
        });

        adminToken = tempToken; // Restore token

        if (response.data.success && response.data.data) {
            const properties = response.data.data;
            const pagination = response.data.pagination;

            log.success(`Retrieved ${properties.length} properties (public access)`);
            log.info(`Total: ${pagination.total}`);
            log.info(`Page: ${pagination.page}/${pagination.pages}`);

            if (properties.length > 0) {
                const prop = properties[0];
                log.info(`\nSample property:`);
                log.info(`  Title: ${prop.title}`);
                log.info(`  Type: ${prop.propertyType}`);
                log.info(`  Location: ${prop.city}, ${prop.state}`);
                log.info(`  Price: ₹${prop.price?.toLocaleString('en-IN') || prop.basePrice?.toLocaleString('en-IN')}`);
            }
            return true;
        } else {
            log.error('Failed to retrieve properties');
            return false;
        }
    } catch (error) {
        log.error(`Failed to get properties: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test9_UserGetPropertyDetails() {
    log.section('TEST 9: Get Property Details (User - Public)');

    if (!testPropertyId) {
        log.error('No test property ID available');
        return false;
    }

    try {
        // Remove token for public access
        const tempToken = adminToken;
        adminToken = null;

        const response = await api.get(`/properties/${testPropertyId}`);

        adminToken = tempToken; // Restore token

        if (response.data.success && response.data.data) {
            const property = response.data.data;
            log.success('Property details retrieved successfully (public access)');
            log.info(`Title: ${property.title}`);
            log.info(`Type: ${property.propertyType}`);
            log.info(`Location: ${property.city}, ${property.state}`);
            log.info(`Price: ₹${property.price?.toLocaleString('en-IN') || property.basePrice?.toLocaleString('en-IN')}`);
            log.info(`Min Investment: ₹${property.minInvestment?.toLocaleString('en-IN') || property.minimumInvestment?.toLocaleString('en-IN')}`);
            log.info(`ROI: ${property.expectedRoiPercent}% over ${property.roiTenureMonths} months`);
            log.info(`Views: ${property.views || 0} (auto-incremented on view)`);
            log.info(`Status: ${property.status}`);
            return true;
        } else {
            log.error('Failed to retrieve property details');
            return false;
        }
    } catch (error) {
        log.error(`Failed to get property details: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test10_UserSearchProperties() {
    log.section('TEST 10: Search Properties (User - Public)');

    try {
        // Remove token for public access
        const tempToken = adminToken;
        adminToken = null;

        const response = await api.get('/properties/search', {
            params: {
                search: 'Villa',
                propertyType: 'VILLA',
                city: 'Goa',
                page: 1,
                size: 10
            }
        });

        adminToken = tempToken; // Restore token

        if (response.data.success && response.data.data) {
            const properties = response.data.data;
            log.success(`Search returned ${properties.length} properties`);

            if (properties.length > 0) {
                log.info(`\nSearch results for "Villa" in Goa:`);
                properties.slice(0, 3).forEach((prop, idx) => {
                    log.info(`  ${idx + 1}. ${prop.title} - ₹${prop.price?.toLocaleString('en-IN') || prop.basePrice?.toLocaleString('en-IN')}`);
                });
            }
            return true;
        } else {
            log.error('Search failed');
            return false;
        }
    } catch (error) {
        log.error(`Search failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test11_UserGetFeaturedProperties() {
    log.section('TEST 11: Get Featured Properties (User - Public)');

    try {
        // Remove token for public access
        const tempToken = adminToken;
        adminToken = null;

        const response = await api.get('/properties/featured', {
            params: { page: 1, size: 10 }
        });

        adminToken = tempToken; // Restore token

        if (response.data.success && response.data.data) {
            const properties = response.data.data;
            log.success(`Retrieved ${properties.length} featured properties`);

            if (properties.length > 0) {
                log.info(`\nFeatured properties:`);
                properties.slice(0, 3).forEach((prop, idx) => {
                    log.info(`  ${idx + 1}. ${prop.title}`);
                });
            }
            return true;
        } else {
            log.error('Failed to retrieve featured properties');
            return false;
        }
    } catch (error) {
        log.error(`Failed to get featured properties: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test12_UserGetPropertyStats() {
    log.section('TEST 12: Get Property Statistics (User - Public)');

    if (!testPropertyId) {
        log.error('No test property ID available');
        return false;
    }

    try {
        // Remove token for public access
        const tempToken = adminToken;
        adminToken = null;

        const response = await api.get(`/properties/${testPropertyId}/stats`);

        adminToken = tempToken; // Restore token

        if (response.data.success && response.data.data) {
            const stats = response.data.data;
            log.success('Property statistics retrieved successfully');
            log.info(`Total Investments: ₹${stats.totalInvestments?.toLocaleString('en-IN') || 0}`);
            log.info(`Total Investors: ${stats.totalInvestorsCount || 0}`);
            log.info(`Average Investment: ₹${stats.averageInvestment?.toLocaleString('en-IN') || 0}`);
            log.info(`Booking Progress: ${stats.bookingProgress}%`);
            log.info(`Views: ${stats.views || 0}`);
            log.info(`Favorites: ${stats.favorites || 0}`);
            return true;
        } else {
            log.error('Failed to retrieve property stats');
            return false;
        }
    } catch (error) {
        log.error(`Failed to get property stats: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test13_GetFilterOptions() {
    log.section('TEST 13: Get Filter Options (User - Public)');

    try {
        // Remove token for public access
        const tempToken = adminToken;
        adminToken = null;

        // Get property types
        const typesResponse = await api.get('/properties/filters/types');
        if (typesResponse.data.success) {
            log.success('Property types retrieved');
            log.info(`Available types: ${typesResponse.data.data.length}`);
            typesResponse.data.data.forEach(type => {
                log.info(`  - ${type.type}: ${type.count} properties`);
            });
        }

        // Get cities
        const citiesResponse = await api.get('/properties/filters/cities');
        if (citiesResponse.data.success) {
            log.success('Cities retrieved');
            log.info(`Available cities: ${citiesResponse.data.data.length}`);
            citiesResponse.data.data.slice(0, 5).forEach(city => {
                log.info(`  - ${city.city}, ${city.state}: ${city.count} properties`);
            });
        }

        // Get price range stats
        const priceResponse = await api.get('/properties/filters/price-range');
        if (priceResponse.data.success) {
            log.success('Price range statistics');
            const stats = priceResponse.data.data;
            log.info(`  Min: ₹${stats.minPrice?.toLocaleString('en-IN')}`);
            log.info(`  Max: ₹${stats.maxPrice?.toLocaleString('en-IN')}`);
            log.info(`  Avg: ₹${stats.avgPrice?.toLocaleString('en-IN')}`);
        }

        adminToken = tempToken; // Restore token
        return true;
    } catch (error) {
        log.error(`Failed to get filter options: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function test14_DeleteProperty() {
    log.section('TEST 14: Delete Property (Admin)');

    if (!testPropertyId) {
        log.error('No test property ID available');
        return false;
    }

    try {
        const response = await api.delete(`/admin/properties/${testPropertyId}`);

        if (response.data.success) {
            log.success('Property deleted successfully');
            log.info(response.data.message);

            // Verify deletion
            try {
                await api.get(`/admin/properties/${testPropertyId}`);
                log.warn('Property still accessible after deletion');
                return false;
            } catch (err) {
                if (err.response?.status === 404) {
                    log.success('Verified: Property no longer accessible');
                    return true;
                }
            }
        } else {
            log.error('Failed to delete property');
            return false;
        }
    } catch (error) {
        log.error(`Failed to delete property: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log(`${colors.bright}${colors.blue}`);
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║     PROPERTY SYSTEM TEST SUITE                     ║');
    console.log('║     Testing Admin & User Property Operations      ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log(colors.reset);

    log.info(`Base URL: ${BASE_URL}`);
    log.info(`Admin Email: ${ADMIN_EMAIL}`);
    log.info(`Starting tests at: ${new Date().toLocaleString()}\n`);

    const tests = [
        { name: 'Admin Login', fn: test1_AdminLogin },
        { name: 'Create Property', fn: test2_CreateProperty },
        { name: 'Get All Properties (Admin)', fn: test3_GetAllProperties },
        { name: 'Get Property by ID', fn: test4_GetPropertyById },
        { name: 'Update Property', fn: test5_UpdateProperty },
        { name: 'Toggle Featured Status', fn: test6_ToggleFeaturedStatus },
        { name: 'Update Property Status', fn: test7_UpdatePropertyStatus },
        { name: 'Get All Properties (User)', fn: test8_UserGetAllProperties },
        { name: 'Get Property Details (User)', fn: test9_UserGetPropertyDetails },
        { name: 'Search Properties (User)', fn: test10_UserSearchProperties },
        { name: 'Get Featured Properties', fn: test11_UserGetFeaturedProperties },
        { name: 'Get Property Statistics', fn: test12_UserGetPropertyStats },
        { name: 'Get Filter Options', fn: test13_GetFilterOptions },
        { name: 'Delete Property', fn: test14_DeleteProperty }
    ];

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const test of tests) {
        try {
            const result = await test.fn();
            results.push({ name: test.name, passed: result });
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            log.error(`Test "${test.name}" threw an exception: ${error.message}`);
            results.push({ name: test.name, passed: false });
            failed++;
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    log.section('TEST SUMMARY');
    console.log(`${colors.bright}Total Tests: ${tests.length}${colors.reset}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`${colors.cyan}Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%${colors.reset}\n`);

    // Detailed results
    console.log('Detailed Results:');
    results.forEach((result, idx) => {
        const status = result.passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
        console.log(`  ${idx + 1}. ${result.name}: ${status}`);
    });

    console.log(`\n${colors.bright}Test completed at: ${new Date().toLocaleString()}${colors.reset}`);

    // Exit code
    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
});
