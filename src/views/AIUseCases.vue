<script setup>
const usecases = [
    {
        title: 'Smart Upselling & Cross-Selling',
        description:
            'AI-driven recommendations: Suggest side dishes, drinks, or desserts based on order history.<br/><br/>Example: “People who ordered steak usually add red wine – would you like to try?”<br/><br/>Works on dine-in tablets, self-ordering kiosks, and delivery apps.'
    },
    {
        title: 'Personalized Offers & Dynamic Discounts',
        description:
            'AI segments customers (families, students, office workers) and tailors discounts.<br/><br/>Dynamic pricing during low-traffic hours (“20% off pizza between 3-5 PM”).<br/><br/>Personalized SMS/email/app notifications for birthdays, anniversaries, etc.'
    },
    {
        title: 'AI-Optimized Menu Engineering',
        description: 'AI analyzes which menu items are high profit vs. low profit.<br/><br/>Highlights “stars” (high sales + high profit) and hides poor performers.<br/><br/>Suggests re-pricing or bundling (e.g., combo deals that boost margins).'
    },
    {
        title: 'Predictive Demand Forecasting',
        description:
            'AI predicts which dishes will sell more based on weather, season, events.<br/><br/>Example: Hot drinks & soups sell more in rainy/cold days → push these in promotions.<br/><br/>Prevents overstocking → saves costs & increases available popular items.'
    },
    {
        title: 'Customer Behavior Tracking & Loyalty AI',
        description: 'AI tracks repeat customers’ favorites → personalized loyalty rewards.<br/><br/>Example: “Your 5th coffee is free” or “10% off your favorite burger today.”<br/><br/>Builds habit & keeps customers coming back.'
    },
    {
        title: 'AI-Driven Marketing Campaigns',
        description:
            'AI identifies slow days/times and automatically launches campaigns.<br/><br/>Example: Monday slump → “Happy Hour 2-for-1 deal” pushed via SMS & social ads.<br/><br/>Integrates with Meta/Google Ads to retarget customers who abandoned online orders.'
    },
    {
        title: 'Dynamic Combo & Bundle Creation',
        description: 'AI analyzes what items are often bought together and creates auto-bundles.<br/><br/>Example: Pizza + Garlic Bread + Coke offered as a “Movie Night Deal.”<br/><br/>Increases average order value (AOV).'
    },
    {
        title: 'AI Chatbots for Conversational Ordering',
        description:
            'Customers can order via WhatsApp, Facebook Messenger, or Website Chatbot.<br/><br/>Chatbot suggests upsells in conversation: “Would you like extra cheese with your pizza?”<br/><br/>Reduces missed orders + increases sales channels.'
    },
    {
        title: 'Delivery Optimization with AI',
        description: 'AI reduces late deliveries → improves customer satisfaction & repeat sales.<br/><br/>Predicts busiest times → ensures staff & riders are ready.<br/><br/>Suggests free delivery promos at strategic times to increase order volume.'
    },
    {
        title: 'Social Media & Review Sentiment AI',
        description: 'AI analyzes reviews/social posts to see what customers love most.<br/><br/>Promotes those items in ads → focus marketing on proven winners.<br/><br/>Detects negative trends early → fixes issues before losing customers.'
    },
    {
        title: 'Gamified Customer Engagement (AI Loyalty 2.0)',
        description: 'AI creates personalized challenges: “Order 3 times this week and get a free dessert.”<br/><br/>“Try 5 new items, unlock 20% off.”<br/><br/>Keeps customers engaged & spending more.'
    },
    {
        title: 'AI-Enhanced Staff Upselling Coaching',
        description: 'AI analyzes staff orders → tells who upsells well.<br/><br/>Suggests scripts for waiters: “Most people add fries with that burger, should I add for you?”<br/><br/>Better-trained staff = more sales per table.'
    }
];
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">AI Use Cases to Boost Restaurant Sales & Revenue</h1>

        <section v-for="(usecase, idx) in usecases" :key="usecase.title" class="mb-6">
            <h2 class="text-lg font-semibold mb-1">🔹 {{ idx + 1 }}. {{ usecase.title }}</h2>
            <p class="text-sm text-gray-700 mb-2" v-html="usecase.description"></p>
        </section>
    </div>
</template>

<style scoped>
.p-4 {
    padding: 1rem;
}
</style>
