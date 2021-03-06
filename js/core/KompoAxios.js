import Action from './Action'
import Alert from './Alert'

export default class KompoAxios{

    constructor(element){

        this.element = element

        this.$_komponent = element instanceof Action ? element.vue : element
        this.$_parentKompoId = this.$_komponent.kompoid

        this.$_route = element.$_data('route')
        this.$_routeMethod = element.$_data('routeMethod')
        this.$_ajaxPayload = element.$_data('ajaxPayload')

        this.$_kompoAction = element.$_data('X-Kompo-Action')
        this.$_kompoTarget = element.$_data('X-Kompo-Target')

        this.$_kompoRoute = element.$_data('kompoRoute')
    
        this.$_ajaxOptionsMethod = element.$_data('ajaxOptionsMethod') 

        this.$_sessionTimeoutMessage = element.$_data('sessionTimeoutMessage')

    }

    /****** Actions ******/ 
    $_actionAxiosRequest(){
        return this.$_axios({
            url: this.$_route, 
            method: this.$_routeMethod || 'POST', //POST when used outside PHP
            data: this.element.getPayloadForStore(),
            headers: Object.assign(
                {'X-Kompo-Info': this.$_getKompoInfo()}, 
                this.$_kompoAction ? { 'X-Kompo-Action': this.$_kompoAction } : {},
                this.$_kompoTarget ? { 'X-Kompo-Target': this.$_kompoTarget } : {}
            )
        })
    }
    $_submitFormAction(){
        return this.$_axios({
            url: this.$_komponent.formInfo.url, 
            method: this.$_komponent.formInfo.method,
            data: this.element.getFormData(),
            headers: Object.assign(
                {
                    'X-Kompo-Info': this.$_getKompoInfo()
                }, 
                this.$_komponent.formInfo.action ? {
                    'X-Kompo-Action': this.$_komponent.formInfo.action
                } : {},
                this.$_kompoTarget ? {
                    'X-Kompo-Target': this.$_kompoTarget,
                    'X-Kompo-Action': 'handle-submit' //X-Kompo-Action above will be overwritten if this.handle
                } : {}
            )
        })
    }

    /******* Komponents *********/
    $_browseQuery(page, sort, addStore){
        return this.$_axios({
            url: this.$_komponent.queryUrl, 
            method: 'POST',
            data: this.$_komponent.preparedFormData(),
            headers: {
                'X-Kompo-Info': this.$_getKompoInfo(),
                'X-Kompo-Page': page,
                'X-Kompo-Sort': sort,
                'X-Kompo-Action': 'browse-items',
                'X-Kompo-Store': JSON.stringify(addStore)
            }
        })
    }
    $_orderQuery(newOrder){
        return this.$_axiosWithErrorHandling({
            url: this.$_komponent.$_orderingUrl, 
            method: 'POST',
            data: {order: newOrder},
            headers: {
                'X-Kompo-Info': this.$_getKompoInfo(),
                'X-Kompo-Action': 'order-items'
            }
        })
    }
    $_loadKomposer(){

        return this.$_axiosWithErrorHandling({
            url: this.$_route, 
            method: this.$_routeMethod,
            data: this.$_ajaxPayload,
            headers: {
                'X-Kompo-Info': this.$_getKompoInfo(),
                'X-Kompo-Action': 'load-komposer',
                'X-Kompo-Target': this.$_kompoTarget //komposerClass here
            }
        })
    }
    $_refreshSelf(url, payload){
        return this.$_axiosWithErrorHandling({
            url: url, 
            method: 'POST',
            data: payload,
            headers: {
                'X-Kompo-Info': this.$_getKompoInfo(),
                'X-Kompo-Action': 'refresh-self'
            }
        })
    }
    $_searchOptions(search){

        return this.$_axiosWithErrorHandling({
            url: this.$_kompoRoute, 
            method: 'POST',
            data: {
                search: search
            },
            headers: {
                'X-Kompo-Info': this.$_getKompoInfo(),
                'X-Kompo-Action': 'search-options',
                'X-Kompo-Target': this.$_ajaxOptionsMethod
            }
        })
    }

    /*** Internal *******/
    $_getKompoInfo(){

        var kompoInfo = this.$_komponent.$_kompoInfo //if a Komposer use own kompoInfo else fetch it

        if(!kompoInfo){
            this.$_komponent.$kompo.vlGetKomposerInfo(this.$_komponent.kompoid, this.$_komponent.$_elKompoId)
            kompoInfo = this.$_komponent.kompoInfo
        }

        return kompoInfo

    }
    $_axiosWithErrorHandling(axiosRequest){

        return this.$_axios(axiosRequest)
                   .catch(e => {

                        this.$_handleAjaxError(e) 

                    })
    }
    $_axios(axiosRequest){
        return axios(axiosRequest)
    }
    $_handleAjaxError(e){                
        if(e.response.status !== 419)
            return new Alert('Error '+e.response.status+' | '+e.response.data.message).asError().emitFrom(this.$_komponent)

        if(confirm(this.$_sessionTimeoutMessage))
            window.location.reload()
    }
}
