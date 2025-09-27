import { defineStore } from 'pinia';

export const useStaffStore = defineStore('staff', {
    state: () => ({
        currentUser: null,
        staff: [],
        roles: {
            admin: {
                name: 'Administrator',
                permissions: ['all'],
                level: 100
            },
            manager: {
                name: 'Manager',
                permissions: ['pos.all', 'kitchen.view', 'reports.all', 'inventory.all', 'staff.manage', 'tables.all', 'menu.all', 'customers.all'],
                level: 80
            },
            cashier: {
                name: 'Cashier',
                permissions: ['pos.all', 'payment.process', 'orders.view', 'customers.basic'],
                level: 40
            },
            waiter: {
                name: 'Waiter/Waitress',
                permissions: ['orders.create', 'orders.edit', 'tables.assign', 'customers.basic', 'pos.basic', 'menu.view'],
                level: 30
            },
            kitchen: {
                name: 'Kitchen Staff',
                permissions: ['kitchen.all', 'orders.update', 'inventory.view'],
                level: 35
            },
            bartender: {
                name: 'Bartender',
                permissions: ['orders.beverages', 'inventory.beverages', 'pos.beverages'],
                level: 30
            },
            host: {
                name: 'Host/Hostess',
                permissions: ['tables.view', 'reservations.all', 'customers.basic'],
                level: 20
            }
        },
        shifts: [],
        currentShift: null,
        attendance: [],
        performance: {
            daily: {},
            weekly: {},
            monthly: {}
        },
        settings: {
            requireClockIn: true,
            trackBreaks: true,
            autoClockOut: true,
            maxShiftHours: 12,
            breakReminders: true,
            overtimeThreshold: 8
        }
    }),

    getters: {
        // Get active staff members
        activeStaff: (state) => {
            return state.staff.filter((member) => member.isActive && member.currentShift);
        },

        // Get staff by role
        staffByRole: (state) => (role) => {
            return state.staff.filter((member) => member.role === role);
        },

        // Get current shift info
        getCurrentShift: (state) => {
            return state.currentShift;
        },

        // Check if user has permission
        hasPermission: (state) => (permission) => {
            if (!state.currentUser) return false;

            const userRole = state.roles[state.currentUser.role];
            if (!userRole) return false;

            // Admin has all permissions
            if (userRole.permissions.includes('all')) return true;

            return userRole.permissions.includes(permission);
        },

        // Get staff performance
        getStaffPerformance:
            (state) =>
            (staffId, period = 'daily') => {
                return (
                    state.performance[period][staffId] || {
                        ordersHandled: 0,
                        salesAmount: 0,
                        customerRating: 0,
                        punctuality: 0
                    }
                );
            },

        // Get current shift hours
        getCurrentShiftHours: (state) => {
            if (!state.currentShift || !state.currentShift.clockInTime) return 0;

            const clockIn = new Date(state.currentShift.clockInTime);
            const now = new Date();
            return (now - clockIn) / (1000 * 60 * 60); // Hours
        },

        // Get staff attendance
        getAttendanceByPeriod: (state) => (startDate, endDate) => {
            return state.attendance.filter((record) => {
                const recordDate = new Date(record.date);
                return recordDate >= startDate && recordDate <= endDate;
            });
        }
    },

    actions: {
        // Initialize staff system
        async initializeStaff() {
            try {
                await this.fetchStaff();
                await this.loadCurrentShift();
                return { success: true };
            } catch (error) {
                console.error('Failed to initialize staff system:', error);
                return { success: false, message: error.message };
            }
        },

        // Fetch all staff
        async fetchStaff() {
            try {
                // Simulate API call - replace with actual endpoint
                const mockStaff = [
                    {
                        id: 'STF001',
                        employeeId: 'EMP001',
                        name: 'John Smith',
                        email: 'john.smith@restaurant.com',
                        phone: '+1234567890',
                        role: 'manager',
                        department: 'management',
                        hireDate: '2023-01-15',
                        isActive: true,
                        avatar: '/avatars/john-smith.jpg',
                        address: '123 Main St, City, State',
                        emergencyContact: {
                            name: 'Jane Smith',
                            phone: '+1234567891',
                            relationship: 'Spouse'
                        },
                        schedule: {
                            monday: { start: '09:00', end: '17:00' },
                            tuesday: { start: '09:00', end: '17:00' },
                            wednesday: { start: '09:00', end: '17:00' },
                            thursday: { start: '09:00', end: '17:00' },
                            friday: { start: '09:00', end: '17:00' },
                            saturday: { start: 'off', end: 'off' },
                            sunday: { start: 'off', end: 'off' }
                        },
                        permissions: [],
                        currentShift: null,
                        performance: {
                            rating: 4.8,
                            ordersHandled: 245,
                            salesGenerated: 15420.5,
                            customerFeedback: 4.7,
                            punctuality: 95.5
                        }
                    },
                    {
                        id: 'STF002',
                        employeeId: 'EMP002',
                        name: 'Sarah Johnson',
                        email: 'sarah.johnson@restaurant.com',
                        phone: '+1234567892',
                        role: 'waiter',
                        department: 'service',
                        hireDate: '2023-03-10',
                        isActive: true,
                        avatar: '/avatars/sarah-johnson.jpg',
                        address: '456 Oak Ave, City, State',
                        emergencyContact: {
                            name: 'Mike Johnson',
                            phone: '+1234567893',
                            relationship: 'Brother'
                        },
                        schedule: {
                            monday: { start: '16:00', end: '00:00' },
                            tuesday: { start: '16:00', end: '00:00' },
                            wednesday: { start: 'off', end: 'off' },
                            thursday: { start: '16:00', end: '00:00' },
                            friday: { start: '16:00', end: '02:00' },
                            saturday: { start: '16:00', end: '02:00' },
                            sunday: { start: '12:00', end: '20:00' }
                        },
                        permissions: [],
                        currentShift: {
                            id: 'SHF001',
                            clockInTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                            status: 'active'
                        },
                        performance: {
                            rating: 4.6,
                            ordersHandled: 189,
                            salesGenerated: 12350.25,
                            customerFeedback: 4.8,
                            punctuality: 92.1
                        }
                    },
                    {
                        id: 'STF003',
                        employeeId: 'EMP003',
                        name: 'Mike Chen',
                        email: 'mike.chen@restaurant.com',
                        phone: '+1234567894',
                        role: 'kitchen',
                        department: 'kitchen',
                        hireDate: '2023-02-20',
                        isActive: true,
                        avatar: '/avatars/mike-chen.jpg',
                        address: '789 Pine St, City, State',
                        emergencyContact: {
                            name: 'Lisa Chen',
                            phone: '+1234567895',
                            relationship: 'Wife'
                        },
                        schedule: {
                            monday: { start: '10:00', end: '18:00' },
                            tuesday: { start: '10:00', end: '18:00' },
                            wednesday: { start: '10:00', end: '18:00' },
                            thursday: { start: '10:00', end: '18:00' },
                            friday: { start: '10:00', end: '18:00' },
                            saturday: { start: '09:00', end: '17:00' },
                            sunday: { start: 'off', end: 'off' }
                        },
                        permissions: [],
                        currentShift: {
                            id: 'SHF002',
                            clockInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                            status: 'active'
                        },
                        performance: {
                            rating: 4.9,
                            ordersHandled: 312,
                            salesGenerated: 0, // Kitchen staff don't handle direct sales
                            customerFeedback: 0,
                            punctuality: 98.2
                        }
                    }
                ];

                this.staff = mockStaff;
                return { success: true };
            } catch (error) {
                console.error('Error fetching staff:', error);
                throw error;
            }
        },

        // Staff login
        async login(credentials) {
            try {
                const { employeeId, password, pin } = credentials;

                // Find staff member
                const staffMember = this.staff.find((s) => s.employeeId === employeeId || s.email === employeeId);

                if (!staffMember) {
                    return { success: false, message: 'Staff member not found' };
                }

                if (!staffMember.isActive) {
                    return { success: false, message: 'Account is deactivated' };
                }

                // Simulate password/PIN verification
                // In real implementation, verify against hashed credentials
                const isValidCredential = password === 'password123' || pin === '1234';

                if (!isValidCredential) {
                    return { success: false, message: 'Invalid credentials' };
                }

                // Set current user
                this.currentUser = staffMember;

                // Auto clock-in if required
                if (this.settings.requireClockIn && !staffMember.currentShift) {
                    await this.clockIn(staffMember.id);
                }

                // Store login session
                if (typeof window !== 'undefined') {
                    localStorage.setItem('currentUser', JSON.stringify(staffMember));
                }

                return {
                    success: true,
                    user: staffMember,
                    message: `Welcome back, ${staffMember.name}!`
                };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, message: 'Login failed' };
            }
        },

        // Staff logout
        async logout() {
            try {
                if (this.currentUser?.currentShift && this.settings.autoClockOut) {
                    await this.clockOut(this.currentUser.id);
                }

                this.currentUser = null;
                this.currentShift = null;

                // Clear stored session
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('currentUser');
                }

                return { success: true, message: 'Logged out successfully' };
            } catch (error) {
                console.error('Logout error:', error);
                return { success: false, message: 'Logout failed' };
            }
        },

        // Clock in
        async clockIn(staffId) {
            try {
                const staffMember = this.staff.find((s) => s.id === staffId);
                if (!staffMember) throw new Error('Staff member not found');

                if (staffMember.currentShift) {
                    return { success: false, message: 'Already clocked in' };
                }

                const shift = {
                    id: `SHF${Date.now()}`,
                    staffId,
                    clockInTime: new Date(),
                    clockOutTime: null,
                    status: 'active',
                    breaks: [],
                    notes: ''
                };

                // Update staff member
                staffMember.currentShift = shift;
                this.shifts.push(shift);
                this.currentShift = shift;

                // Record attendance
                this.recordAttendance(staffId, 'clock_in');

                return {
                    success: true,
                    shift,
                    message: `${staffMember.name} clocked in successfully`
                };
            } catch (error) {
                console.error('Clock in error:', error);
                return { success: false, message: error.message };
            }
        },

        // Clock out
        async clockOut(staffId) {
            try {
                const staffMember = this.staff.find((s) => s.id === staffId);
                if (!staffMember) throw new Error('Staff member not found');

                if (!staffMember.currentShift) {
                    return { success: false, message: 'Not clocked in' };
                }

                const shift = staffMember.currentShift;
                shift.clockOutTime = new Date();
                shift.status = 'completed';

                // Calculate shift duration
                const duration = (shift.clockOutTime - new Date(shift.clockInTime)) / (1000 * 60 * 60);
                shift.duration = duration;

                // Check for overtime
                if (duration > this.settings.overtimeThreshold) {
                    shift.overtime = duration - this.settings.overtimeThreshold;
                }

                // Clear current shift
                staffMember.currentShift = null;
                this.currentShift = null;

                // Record attendance
                this.recordAttendance(staffId, 'clock_out');

                return {
                    success: true,
                    shift,
                    message: `${staffMember.name} clocked out successfully`
                };
            } catch (error) {
                console.error('Clock out error:', error);
                return { success: false, message: error.message };
            }
        },

        // Start break
        async startBreak(staffId, type = 'break') {
            try {
                const staffMember = this.staff.find((s) => s.id === staffId);
                if (!staffMember?.currentShift) {
                    return { success: false, message: 'Not clocked in' };
                }

                const breakRecord = {
                    id: `BRK${Date.now()}`,
                    type, // break, lunch, personal
                    startTime: new Date(),
                    endTime: null,
                    duration: null
                };

                staffMember.currentShift.breaks.push(breakRecord);
                staffMember.currentShift.status = 'on_break';

                return {
                    success: true,
                    break: breakRecord,
                    message: `Break started for ${staffMember.name}`
                };
            } catch (error) {
                console.error('Start break error:', error);
                return { success: false, message: error.message };
            }
        },

        // End break
        async endBreak(staffId) {
            try {
                const staffMember = this.staff.find((s) => s.id === staffId);
                if (!staffMember?.currentShift) {
                    return { success: false, message: 'Not clocked in' };
                }

                const activeBreak = staffMember.currentShift.breaks.find((b) => !b.endTime);
                if (!activeBreak) {
                    return { success: false, message: 'No active break found' };
                }

                activeBreak.endTime = new Date();
                activeBreak.duration = (activeBreak.endTime - new Date(activeBreak.startTime)) / (1000 * 60); // Minutes

                staffMember.currentShift.status = 'active';

                return {
                    success: true,
                    break: activeBreak,
                    message: `Break ended for ${staffMember.name}`
                };
            } catch (error) {
                console.error('End break error:', error);
                return { success: false, message: error.message };
            }
        },

        // Record attendance
        recordAttendance(staffId, action, notes = '') {
            const record = {
                id: `ATT${Date.now()}`,
                staffId,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date(),
                action, // clock_in, clock_out, late, absent
                notes
            };

            this.attendance.push(record);
        },

        // Create staff member
        async createStaff(staffData) {
            try {
                const newStaff = {
                    ...staffData,
                    id: `STF${String(this.staff.length + 1).padStart(3, '0')}`,
                    hireDate: new Date().toISOString().split('T')[0],
                    isActive: true,
                    currentShift: null,
                    performance: {
                        rating: 0,
                        ordersHandled: 0,
                        salesGenerated: 0,
                        customerFeedback: 0,
                        punctuality: 100
                    }
                };

                this.staff.push(newStaff);
                return { success: true, staff: newStaff };
            } catch (error) {
                console.error('Create staff error:', error);
                return { success: false, message: error.message };
            }
        },

        // Update staff member
        async updateStaff(staffId, updates) {
            try {
                const staffIndex = this.staff.findIndex((s) => s.id === staffId);
                if (staffIndex === -1) throw new Error('Staff member not found');

                this.staff[staffIndex] = { ...this.staff[staffIndex], ...updates };
                return { success: true, staff: this.staff[staffIndex] };
            } catch (error) {
                console.error('Update staff error:', error);
                return { success: false, message: error.message };
            }
        },

        // Deactivate staff member
        async deactivateStaff(staffId) {
            try {
                const staff = this.staff.find((s) => s.id === staffId);
                if (!staff) throw new Error('Staff member not found');

                // Clock out if currently working
                if (staff.currentShift) {
                    await this.clockOut(staffId);
                }

                staff.isActive = false;
                return { success: true, message: `${staff.name} has been deactivated` };
            } catch (error) {
                console.error('Deactivate staff error:', error);
                return { success: false, message: error.message };
            }
        },

        // Load current shift from storage
        loadCurrentShift() {
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    this.currentUser = JSON.parse(storedUser);
                    this.currentShift = this.currentUser.currentShift;
                }
            }
        },

        // Update staff performance
        updatePerformance(staffId, metrics) {
            const staff = this.staff.find((s) => s.id === staffId);
            if (staff) {
                staff.performance = { ...staff.performance, ...metrics };

                // Update period performance
                const today = new Date().toISOString().split('T')[0];
                if (!this.performance.daily[staffId]) {
                    this.performance.daily[staffId] = {};
                }
                this.performance.daily[staffId][today] = metrics;
            }
        },

        // Generate staff report
        generateStaffReport(staffId, period = 'daily') {
            const staff = this.staff.find((s) => s.id === staffId);
            if (!staff) return null;

            const performance = this.performance[period][staffId] || {};
            const shifts = this.shifts.filter((s) => s.staffId === staffId && s.status === 'completed');

            return {
                staff,
                performance,
                shifts,
                totalHours: shifts.reduce((total, shift) => total + (shift.duration || 0), 0),
                averageShiftLength: shifts.length > 0 ? shifts.reduce((total, shift) => total + (shift.duration || 0), 0) / shifts.length : 0
            };
        }
    }
});
