import * as userSettings from '../scripts/settings/userSettings';
import loading from '../components/loading/loading';
import focusManager from '../components/focusManager';
import homeSections from '../components/homesections/homesections';
import '../elements/emby-itemscontainer/emby-itemscontainer';
import ServerConnections from '../components/ServerConnections';
import { renderFeaturedSlider } from '../components/featuredSlider/featuredSlider';
import '../components/featuredSlider/featuredSlider.css';

class HomeTab {
    constructor(view, params) {
        this.view = view;
        this.params = params;
        this.apiClient = ServerConnections.currentApiClient();
        this.sectionsContainer = view.querySelector('.sections');
        view.querySelector('.sections').addEventListener('settingschange', onHomeScreenSettingsChanged.bind(this));
    }
    onResume(options) {
        if (this.sectionsRendered) {
            const sectionsContainer = this.sectionsContainer;

            if (sectionsContainer) {
                return homeSections.resume(sectionsContainer, options);
            }

            return Promise.resolve();
        }

        loading.show();
        const view = this.view;
        const apiClient = this.apiClient;
        this.destroyHomeSections();
        this.sectionsRendered = true;

        loadFeaturedSlider(view, apiClient);

        return apiClient.getCurrentUser()
            .then(user => homeSections.loadSections(view.querySelector('.sections'), apiClient, user, userSettings))
            .then(() => {
                if (options.autoFocus) {
                    focusManager.autoFocus(view);
                }
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                loading.hide();
            });
    }
    onPause() {
        const sectionsContainer = this.sectionsContainer;

        if (sectionsContainer) {
            homeSections.pause(sectionsContainer);
        }
    }
    destroy() {
        this.view = null;
        this.params = null;
        this.apiClient = null;
        this.destroyHomeSections();
        this.sectionsContainer = null;
    }
    destroyHomeSections() {
        const sectionsContainer = this.sectionsContainer;

        if (sectionsContainer) {
            homeSections.destroySections(sectionsContainer);
        }
    }
}

function loadFeaturedSlider(view, apiClient) {
    const featuredBar = view.querySelector('.featured-media-bar');
    if (!featuredBar) return;

    const queryParams = {
        UserId: apiClient.getCurrentUserId(),
        IncludeItemTypes: 'Movie,Series',
        Recursive: 'true',
        Filter: 'IsUnplayed',
        EnableImages: 'true',
        SortBy: 'Random',
        Limit: 200,
        hasOverview: true,
        imageTypes: 'Logo,Backdrop',
        fields: ['Overview'],
        EnableUserData: true // To ensure proper user-specific filters
    };

    const qs = Object.keys(queryParams)
        .map(key => key + '=' + encodeURIComponent(queryParams[key]))
        .join('&');

    apiClient.getJSON(apiClient.getUrl(`/Items?${qs}`))
        .then(function (result) {
            console.log('Featured Items:', result);
            renderFeaturedSlider(featuredBar, result.Items || [], apiClient);
        })
        .catch(err => console.error(err));
}

function onHomeScreenSettingsChanged() {
    this.sectionsRendered = false;

    if (!this.paused) {
        this.onResume({
            refresh: true
        });
    }
}

export default HomeTab;
