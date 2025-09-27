<script setup>
import { ref, computed } from 'vue';
import { usePosStore } from '@/stores/pos.js';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Divider from 'primevue/divider';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import Chip from 'primevue/chip';
import Rating from 'primevue/rating';

const props = defineProps({
    visible: Boolean,
    customer: Object
});

const emit = defineEmits(['update:visible', 'customer-saved']);

const posStore = usePosStore();
const toast = useToast();

// Comprehensive customer form
const customerForm = ref({
    // Basic Information
    id: null,
    customerId: '',
    firstName: '',
    lastName: '',
    displayName: '',
    dateOfBirth: null,
    gender: '',

    // Contact Information
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    preferredContact: 'phone', // phone, email, sms

    // Address Information
    addresses: [
        {
            type: 'home',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US',
            isDefault: true,
            deliveryInstructions: ''
        }
    ],

    // Dining Preferences
    preferredTable: '',
    dietaryRestrictions: [],
    allergies: [],
    spicePreference: 'medium', // mild, medium, hot, extra_hot
    seatingPreference: '', // booth, table, bar, patio

    // Loyalty & Membership
    loyaltyMembership: {
        memberId: '',
        memberSince: null,
        tier: 'bronze', // bronze, silver, gold, platinum, diamond
        points: 0,
        totalSpent: 0,
        visits: 0,
        lastVisit: null,
        preferredRewards: []
    },

    // Order History & Preferences
    orderHistory: [],
    favoriteItems: [],
    averageOrderValue: 0,
    totalLifetimeValue: 0,
    orderFrequency: 'occasional', // regular, occasional, rare, new

    // Special Occasions
    anniversaryDate: null,
    membershipRenewalDate: null,
    birthdayOffers: true,
    anniversaryOffers: true,

    // Communication Preferences
    marketingOptIn: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newsletter: false,

    // Payment Information
    defaultPaymentMethod: 'cash',
    savedPaymentMethods: [],
    creditLimit: 0,
    accountBalance: 0,

    // Corporate & Group Information
    customerType: 'individual', // individual, corporate, group
    companyName: '',
    taxId: '',
    corporateDiscount: 0,
    groupSize: 1,

    // Special Notes
    notes: '',
    tags: [],
    vipStatus: false,
    blacklisted: false,

    // System Fields
    createdAt: null,
    updatedAt: null,
    createdBy: '',
    lastModifiedBy: '',

    // Social & Reviews
    socialMedia: {
        facebook: '',
        instagram: '',
        twitter: ''
    },
    reviewsGiven: [],
    averageRating: 0,

    // Emergency Contact
    emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
    }
});

// Options for dropdowns
const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' }
];

const loyaltyTiers = [
    { label: 'Bronze', value: 'bronze' },
    { label: 'Silver', value: 'silver' },
    { label: 'Gold', value: 'gold' },
    { label: 'Platinum', value: 'platinum' },
    { label: 'Diamond', value: 'diamond' }
];

const dietaryRestrictions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Kosher', 'Halal', 'Keto', 'Paleo', 'Low-Sodium', 'Diabetic'];

const commonAllergies = ['Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Eggs', 'Milk', 'Soy', 'Wheat/Gluten', 'Sesame', 'Sulfites'];

const spicePreferences = [
    { label: 'Mild', value: 'mild' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hot', value: 'hot' },
    { label: 'Extra Hot', value: 'extra_hot' }
];

const customerTypes = [
    { label: 'Individual', value: 'individual' },
    { label: 'Corporate', value: 'corporate' },
    { label: 'Group/Event', value: 'group' },
    { label: 'Catering', value: 'catering' }
];

const paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'Debit Card', value: 'debit_card' },
    { label: 'Mobile Payment', value: 'mobile_payment' },
    { label: 'House Account', value: 'house_account' }
];

// Methods
const addAddress = () => {
    customerForm.value.addresses.push({
        type: 'other',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
        isDefault: false,
        deliveryInstructions: ''
    });
};

const removeAddress = (index) => {
    if (customerForm.value.addresses.length > 1) {
        customerForm.value.addresses.splice(index, 1);
    }
};

const addDietaryRestriction = (restriction) => {
    if (!customerForm.value.dietaryRestrictions.includes(restriction)) {
        customerForm.value.dietaryRestrictions.push(restriction);
    }
};

const removeDietaryRestriction = (restriction) => {
    const index = customerForm.value.dietaryRestrictions.indexOf(restriction);
    if (index > -1) {
        customerForm.value.dietaryRestrictions.splice(index, 1);
    }
};

const addAllergy = (allergy) => {
    if (!customerForm.value.allergies.includes(allergy)) {
        customerForm.value.allergies.push(allergy);
    }
};

const removeAllergy = (allergy) => {
    const index = customerForm.value.allergies.indexOf(allergy);
    if (index > -1) {
        customerForm.value.allergies.splice(index, 1);
    }
};

const saveCustomer = () => {
    // Validate required fields
    if (!customerForm.value.firstName || !customerForm.value.lastName) {
        toast.add({
            severity: 'warn',
            summary: 'Missing Information',
            detail: 'First name and last name are required',
            life: 3000
        });
        return;
    }

    // Generate customer ID if new
    if (!customerForm.value.id) {
        customerForm.value.id = Date.now();
        customerForm.value.customerId = `CUST-${Date.now()}`;
        customerForm.value.createdAt = new Date().toISOString();
        customerForm.value.loyaltyMembership.memberSince = new Date().toISOString();
    }

    customerForm.value.updatedAt = new Date().toISOString();
    customerForm.value.displayName = `${customerForm.value.firstName} ${customerForm.value.lastName}`;

    // Set customer info in POS store
    posStore.setCustomerInfo(customerForm.value);

    emit('customer-saved', customerForm.value);
    emit('update:visible', false);

    toast.add({
        severity: 'success',
        summary: 'Customer Saved',
        detail: `${customerForm.value.displayName} information has been saved`,
        life: 3000
    });
};

const generateCustomerReport = () => {
    const report = {
        basicInfo: {
            name: customerForm.value.displayName,
            memberId: customerForm.value.loyaltyMembership.memberId,
            memberSince: customerForm.value.loyaltyMembership.memberSince,
            tier: customerForm.value.loyaltyMembership.tier
        },
        statistics: {
            totalSpent: customerForm.value.totalLifetimeValue,
            visits: customerForm.value.loyaltyMembership.visits,
            averageOrderValue: customerForm.value.averageOrderValue,
            loyaltyPoints: customerForm.value.loyaltyMembership.points
        },
        preferences: {
            dietaryRestrictions: customerForm.value.dietaryRestrictions,
            allergies: customerForm.value.allergies,
            spicePreference: customerForm.value.spicePreference,
            favoriteItems: customerForm.value.favoriteItems
        }
    };

    console.log('Customer Report:', report);

    toast.add({
        severity: 'info',
        summary: 'Report Generated',
        detail: 'Customer report has been generated and logged to console',
        life: 3000
    });
};

// Initialize form when dialog opens
const initializeForm = () => {
    if (props.customer) {
        customerForm.value = { ...props.customer };
    } else {
        // Reset to default values for new customer
        customerForm.value = {
            // Reset all fields to initial state
            id: null,
            customerId: '',
            firstName: '',
            lastName: ''
            // ... (rest of the default values)
        };
    }
};

// Watch for dialog visibility changes
watch(
    () => props.visible,
    (visible) => {
        if (visible) {
            initializeForm();
        }
    }
);
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Comprehensive Customer Management" :modal="true" :style="{ width: '95vw', maxWidth: '1200px', height: '90vh' }" :maximizable="true">
        <div class="customer-management">
            <TabView scrollable>
                <!-- Basic Information -->
                <TabPanel header="Basic Info">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <template #title>Personal Information</template>
                            <template #content>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">First Name *</label>
                                        <InputText v-model="customerForm.firstName" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Last Name *</label>
                                        <InputText v-model="customerForm.lastName" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Date of Birth</label>
                                        <Calendar v-model="customerForm.dateOfBirth" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Gender</label>
                                        <Dropdown v-model="customerForm.gender" :options="genderOptions" option-label="label" option-value="value" class="w-full" />
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium mb-2">Customer Type</label>
                                        <Dropdown v-model="customerForm.customerType" :options="customerTypes" option-label="label" option-value="value" class="w-full" />
                                    </div>
                                </div>
                            </template>
                        </Card>

                        <Card>
                            <template #title>Contact Information</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Primary Phone</label>
                                        <InputText v-model="customerForm.primaryPhone" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Secondary Phone</label>
                                        <InputText v-model="customerForm.secondaryPhone" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Email</label>
                                        <InputText v-model="customerForm.email" type="email" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Preferred Contact Method</label>
                                        <Dropdown
                                            v-model="customerForm.preferredContact"
                                            :options="[
                                                { label: 'Phone', value: 'phone' },
                                                { label: 'Email', value: 'email' },
                                                { label: 'SMS', value: 'sms' }
                                            ]"
                                            option-label="label"
                                            option-value="value"
                                            class="w-full"
                                        />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </TabPanel>

                <!-- Loyalty & Membership -->
                <TabPanel header="Loyalty Program">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <template #title>Membership Details</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Member ID</label>
                                        <InputText v-model="customerForm.loyaltyMembership.memberId" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Membership Tier</label>
                                        <Dropdown v-model="customerForm.loyaltyMembership.tier" :options="loyaltyTiers" option-label="label" option-value="value" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Current Points</label>
                                        <InputNumber v-model="customerForm.loyaltyMembership.points" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Total Spent</label>
                                        <InputNumber v-model="customerForm.loyaltyMembership.totalSpent" mode="currency" currency="USD" locale="en-US" class="w-full" />
                                    </div>
                                </div>
                            </template>
                        </Card>

                        <Card>
                            <template #title>Visit Statistics</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Total Visits</label>
                                        <InputNumber v-model="customerForm.loyaltyMembership.visits" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Last Visit</label>
                                        <Calendar v-model="customerForm.loyaltyMembership.lastVisit" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Average Order Value</label>
                                        <InputNumber v-model="customerForm.averageOrderValue" mode="currency" currency="USD" locale="en-US" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Lifetime Value</label>
                                        <InputNumber v-model="customerForm.totalLifetimeValue" mode="currency" currency="USD" locale="en-US" class="w-full" />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </TabPanel>

                <!-- Dining Preferences -->
                <TabPanel header="Dining Preferences">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <template #title>Food Preferences</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Spice Preference</label>
                                        <Dropdown v-model="customerForm.spicePreference" :options="spicePreferences" option-label="label" option-value="value" class="w-full" />
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium mb-2">Dietary Restrictions</label>
                                        <div class="flex flex-wrap gap-2 mb-2">
                                            <Chip v-for="restriction in customerForm.dietaryRestrictions" :key="restriction" :label="restriction" removable @remove="removeDietaryRestriction(restriction)" />
                                        </div>
                                        <Dropdown :options="dietaryRestrictions.filter((r) => !customerForm.dietaryRestrictions.includes(r))" placeholder="Add dietary restriction" @change="addDietaryRestriction($event.value)" class="w-full" />
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium mb-2">Allergies</label>
                                        <div class="flex flex-wrap gap-2 mb-2">
                                            <Chip v-for="allergy in customerForm.allergies" :key="allergy" :label="allergy" removable severity="danger" @remove="removeAllergy(allergy)" />
                                        </div>
                                        <Dropdown :options="commonAllergies.filter((a) => !customerForm.allergies.includes(a))" placeholder="Add allergy" @change="addAllergy($event.value)" class="w-full" />
                                    </div>
                                </div>
                            </template>
                        </Card>

                        <Card>
                            <template #title>Seating & Service</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Preferred Table</label>
                                        <InputText v-model="customerForm.preferredTable" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Seating Preference</label>
                                        <Dropdown
                                            v-model="customerForm.seatingPreference"
                                            :options="[
                                                { label: 'Booth', value: 'booth' },
                                                { label: 'Table', value: 'table' },
                                                { label: 'Bar', value: 'bar' },
                                                { label: 'Patio', value: 'patio' }
                                            ]"
                                            option-label="label"
                                            option-value="value"
                                            class="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Default Payment Method</label>
                                        <Dropdown v-model="customerForm.defaultPaymentMethod" :options="paymentMethods" option-label="label" option-value="value" class="w-full" />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </TabPanel>

                <!-- Communication -->
                <TabPanel header="Communication">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <template #title>Notification Preferences</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div class="flex items-center">
                                        <Checkbox v-model="customerForm.emailNotifications" binary />
                                        <label class="ml-2">Email Notifications</label>
                                    </div>
                                    <div class="flex items-center">
                                        <Checkbox v-model="customerForm.smsNotifications" binary />
                                        <label class="ml-2">SMS Notifications</label>
                                    </div>
                                    <div class="flex items-center">
                                        <Checkbox v-model="customerForm.pushNotifications" binary />
                                        <label class="ml-2">Push Notifications</label>
                                    </div>
                                    <div class="flex items-center">
                                        <Checkbox v-model="customerForm.newsletter" binary />
                                        <label class="ml-2">Newsletter Subscription</label>
                                    </div>
                                    <div class="flex items-center">
                                        <Checkbox v-model="customerForm.marketingOptIn" binary />
                                        <label class="ml-2">Marketing Communications</label>
                                    </div>
                                </div>
                            </template>
                        </Card>

                        <Card>
                            <template #title>Special Occasions</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Anniversary Date</label>
                                        <Calendar v-model="customerForm.anniversaryDate" class="w-full" />
                                    </div>
                                    <div class="flex items-center">
                                        <Checkbox v-model="customerForm.birthdayOffers" binary />
                                        <label class="ml-2">Birthday Offers</label>
                                    </div>
                                    <div class="flex items-center">
                                        <Checkbox v-model="customerForm.anniversaryOffers" binary />
                                        <label class="ml-2">Anniversary Offers</label>
                                    </div>
                                    <div class="flex items-center">
                                        <Checkbox v-model="customerForm.vipStatus" binary />
                                        <label class="ml-2">VIP Status</label>
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </TabPanel>

                <!-- Notes & Analytics -->
                <TabPanel header="Notes & Analytics">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <template #title>Customer Notes</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Special Notes</label>
                                        <Textarea v-model="customerForm.notes" rows="6" class="w-full" placeholder="Add any special notes about this customer..." />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Customer Rating</label>
                                        <Rating v-model="customerForm.averageRating" />
                                    </div>
                                </div>
                            </template>
                        </Card>

                        <Card>
                            <template #title>Emergency Contact</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Emergency Contact Name</label>
                                        <InputText v-model="customerForm.emergencyContact.name" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Emergency Contact Phone</label>
                                        <InputText v-model="customerForm.emergencyContact.phone" class="w-full" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Relationship</label>
                                        <InputText v-model="customerForm.emergencyContact.relationship" class="w-full" />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </TabPanel>
            </TabView>
        </div>

        <template #footer>
            <div class="flex justify-between items-center w-full">
                <Button label="Generate Report" icon="pi pi-chart-bar" severity="info" @click="generateCustomerReport" />
                <div class="flex gap-2">
                    <Button label="Cancel" severity="secondary" @click="$emit('update:visible', false)" />
                    <Button label="Save Customer" icon="pi pi-save" @click="saveCustomer" />
                </div>
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.customer-management {
    min-height: 600px;
}

:deep(.p-tabview-panels) {
    padding: 1rem 0;
}

:deep(.p-card-content) {
    padding: 1rem;
}
</style>
