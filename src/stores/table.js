import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTableStore = defineStore('table', () => {
    // State
    const tables = ref([]);
    const isLoading = ref(false);
    const floorLayout = ref({
        width: 1200,
        height: 800,
        backgroundColor: '#f8f9fa'
    });

    // Table status constants
    const TABLE_STATUS = {
        FREE: 'free',
        OCCUPIED: 'occupied',
        RESERVED: 'reserved',
        CLEANING: 'cleaning',
        OUT_OF_ORDER: 'out_of_order'
    };

    // Getters
    const availableTables = computed(() => {
        return tables.value.filter((table) => table.status === TABLE_STATUS.FREE);
    });

    const occupiedTables = computed(() => {
        return tables.value.filter((table) => table.status === TABLE_STATUS.OCCUPIED);
    });

    const reservedTables = computed(() => {
        return tables.value.filter((table) => table.status === TABLE_STATUS.RESERVED);
    });

    const getTableById = computed(() => {
        return (id) => tables.value.find((table) => table.id === id);
    });

    const getTablesByWaiter = computed(() => {
        return (waiterId) => tables.value.filter((table) => table.assignedWaiter === waiterId);
    });

    const tableStatistics = computed(() => {
        const stats = {
            total: tables.value.length,
            free: 0,
            occupied: 0,
            reserved: 0,
            cleaning: 0,
            outOfOrder: 0
        };

        tables.value.forEach((table) => {
            switch (table.status) {
                case TABLE_STATUS.FREE:
                    stats.free++;
                    break;
                case TABLE_STATUS.OCCUPIED:
                    stats.occupied++;
                    break;
                case TABLE_STATUS.RESERVED:
                    stats.reserved++;
                    break;
                case TABLE_STATUS.CLEANING:
                    stats.cleaning++;
                    break;
                case TABLE_STATUS.OUT_OF_ORDER:
                    stats.outOfOrder++;
                    break;
            }
        });

        return stats;
    });

    // Actions
    const fetchTables = async () => {
        isLoading.value = true;
        try {
            const response = await simulateFetchTables();
            tables.value = response;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const addTable = async (tableData) => {
        isLoading.value = true;
        try {
            const response = await simulateAddTable(tableData);
            tables.value.push(response);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const updateTable = async (id, tableData) => {
        isLoading.value = true;
        try {
            const response = await simulateUpdateTable(id, tableData);
            const index = tables.value.findIndex((table) => table.id === id);
            if (index !== -1) {
                tables.value[index] = response;
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const deleteTable = async (id) => {
        isLoading.value = true;
        try {
            await simulateDeleteTable();
            tables.value = tables.value.filter((table) => table.id !== id);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const updateTableStatus = async (id, status, assignedWaiter = null) => {
        const table = tables.value.find((table) => table.id === id);
        if (table) {
            table.status = status;
            if (assignedWaiter !== null) {
                table.assignedWaiter = assignedWaiter;
            }
            if (status === TABLE_STATUS.FREE) {
                table.assignedWaiter = null;
                table.currentOrder = null;
            }
            // In real app, sync with backend
            await simulateUpdateTableStatus(id, status);
        }
    };

    const updateTablePosition = async (id, position) => {
        const table = tables.value.find((table) => table.id === id);
        if (table) {
            table.x = position.x;
            table.y = position.y;
            // In real app, sync with backend
            await simulateUpdateTablePosition(id, position);
        }
    };

    const assignWaiterToTable = async (tableId, waiterId) => {
        const table = tables.value.find((table) => table.id === tableId);
        if (table) {
            table.assignedWaiter = waiterId;
            // In real app, sync with backend
            await simulateAssignWaiter(tableId, waiterId);
        }
    };

    const reserveTable = async (tableId, reservationData) => {
        const table = tables.value.find((table) => table.id === tableId);
        if (table && table.status === TABLE_STATUS.FREE) {
            table.status = TABLE_STATUS.RESERVED;
            table.reservation = reservationData;
            // In real app, sync with backend
            await simulateReserveTable(tableId, reservationData);
            return { success: true };
        }
        return { success: false, message: 'Table is not available for reservation' };
    };

    const clearReservation = async (tableId) => {
        const table = tables.value.find((table) => table.id === tableId);
        if (table) {
            table.status = TABLE_STATUS.FREE;
            table.reservation = null;
            // In real app, sync with backend
            await simulateClearReservation(tableId);
        }
    };

    // Mock API functions (replace with actual API calls)
    const simulateFetchTables = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        number: 'T1',
                        name: 'Table 1',
                        seats: 4,
                        status: TABLE_STATUS.FREE,
                        x: 100,
                        y: 100,
                        width: 80,
                        height: 80,
                        shape: 'rectangle',
                        assignedWaiter: null,
                        currentOrder: null,
                        reservation: null
                    },
                    {
                        id: 2,
                        number: 'T2',
                        name: 'Table 2',
                        seats: 2,
                        status: TABLE_STATUS.OCCUPIED,
                        x: 200,
                        y: 100,
                        width: 60,
                        height: 60,
                        shape: 'circle',
                        assignedWaiter: 3,
                        currentOrder: { id: 101, total: 45.5 },
                        reservation: null
                    },
                    {
                        id: 3,
                        number: 'T3',
                        name: 'Table 3',
                        seats: 6,
                        status: TABLE_STATUS.RESERVED,
                        x: 300,
                        y: 150,
                        width: 100,
                        height: 80,
                        shape: 'rectangle',
                        assignedWaiter: null,
                        currentOrder: null,
                        reservation: {
                            customerName: 'John Doe',
                            phone: '+1234567890',
                            time: '2024-01-15T19:00:00',
                            partySize: 4
                        }
                    },
                    {
                        id: 4,
                        number: 'T4',
                        name: 'Table 4',
                        seats: 8,
                        status: TABLE_STATUS.FREE,
                        x: 150,
                        y: 250,
                        width: 120,
                        height: 80,
                        shape: 'rectangle',
                        assignedWaiter: null,
                        currentOrder: null,
                        reservation: null
                    }
                ]);
            }, 500);
        });
    };

    const simulateAddTable = async (tableData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: Date.now(),
                    ...tableData,
                    status: TABLE_STATUS.FREE,
                    assignedWaiter: null,
                    currentOrder: null,
                    reservation: null
                });
            }, 500);
        });
    };

    const simulateUpdateTable = async (id, tableData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id,
                    ...tableData
                });
            }, 300);
        });
    };

    const simulateDeleteTable = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 300);
        });
    };

    const simulateUpdateTableStatus = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 200);
        });
    };

    const simulateUpdateTablePosition = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 200);
        });
    };

    const simulateAssignWaiter = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 200);
        });
    };

    const simulateReserveTable = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 300);
        });
    };

    const simulateClearReservation = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 200);
        });
    };

    return {
        // State
        tables,
        isLoading,
        floorLayout,
        TABLE_STATUS,

        // Getters
        availableTables,
        occupiedTables,
        reservedTables,
        getTableById,
        getTablesByWaiter,
        tableStatistics,

        // Actions
        fetchTables,
        addTable,
        updateTable,
        deleteTable,
        updateTableStatus,
        updateTablePosition,
        assignWaiterToTable,
        reserveTable,
        clearReservation
    };
});
