import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Ripple from 'primevue/ripple';

// Core Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Password from 'primevue/password';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import Sidebar from 'primevue/sidebar';
import Menu from 'primevue/menu';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Toolbar from 'primevue/toolbar';
import SplitButton from 'primevue/splitbutton';
import Divider from 'primevue/divider';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Panel from 'primevue/panel';
import Fieldset from 'primevue/fieldset';
import FileUpload from 'primevue/fileupload';
import MultiSelect from 'primevue/multiselect';
import OverlayPanel from 'primevue/overlaypanel';
import Paginator from 'primevue/paginator';
import ContextMenu from 'primevue/contextmenu';
import ConfirmDialog from 'primevue/confirmdialog';

import '@/assets/styles.scss';

// Create Pinia store
const pinia = createPinia();

const app = createApp(App);

app.config.devtools = true;

app.use(router);
app.use(pinia);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    },
    ripple: true
});
app.use(ToastService);
app.use(ConfirmationService);

// Global Component Registration
app.component('Button', Button);
app.component('Card', Card);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('InputText', InputText);
app.component('InputNumber', InputNumber);
app.component('Password', Password);
app.component('Dropdown', Dropdown);
app.component('Calendar', Calendar);
app.component('Checkbox', Checkbox);
app.component('RadioButton', RadioButton);
app.component('Textarea', Textarea);
app.component('Dialog', Dialog);
app.component('Toast', Toast);
app.component('Sidebar', Sidebar);
app.component('Menu', Menu);
app.component('Badge', Badge);
app.component('Avatar', Avatar);
app.component('Chip', Chip);
app.component('Tag', Tag);
app.component('ProgressBar', ProgressBar);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Toolbar', Toolbar);
app.component('SplitButton', SplitButton);
app.component('Divider', Divider);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('Accordion', Accordion);
app.component('AccordionTab', AccordionTab);
app.component('Panel', Panel);
app.component('Fieldset', Fieldset);
app.component('FileUpload', FileUpload);
app.component('MultiSelect', MultiSelect);
app.component('OverlayPanel', OverlayPanel);
app.component('Paginator', Paginator);
app.component('ContextMenu', ContextMenu);
app.component('ConfirmDialog', ConfirmDialog);

// Global Directives
app.directive('ripple', Ripple);

app.mount('#app');
