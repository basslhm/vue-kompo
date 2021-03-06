<template>

    <transition name="modal">

        <div 
            class="vlModalMask" 
            ref="modal" 
            tabindex="0"
            @keydown.left="previous"
            @keydown.right="next"
            @mousedown="mouseDown" 
            @mouseup="mouseUp" 
             v-if="opened" 
            :style="{'z-index': zIndex - 2 }">

            <div class="vlModalClose" 
                :style="{'z-index': zIndex + 2 }">
              <i class="icon-times-circle"></i>
            </div>

            <i v-if="arrows" class="vlModalBtn icon-chevron-left" 
                @mouseup.stop="previous" />

            <i v-if="arrows" class="vlModalBtn icon-chevron-right" 
                @mouseup.stop="next" />

            <div class="vlModalWrapper">

                <div 
                    class="vlModalContainer" 
                    :id="'vlModalContainer'+name"
                    ref="modalContainer"
                    :style="{'width': width}">

                    <!-- v-if necessary -->
                    <vl-panel 
                        v-if="panelId" 
                        v-show="ajaxContent"
                        :id="panelId" />
                
                    <slot />

                </div>
                
            </div>

        </div>
        
    </transition>
</template>

<script>
import EmitsEvents from '../mixins/EmitsEvents'

export default {
    mixins: [EmitsEvents],
    props: ['name', 'width', 'warn', 'arrows'],
    data(){
        return {
            readyToClose: false,
            opened : false,
            ajaxContent: false,
            zIndex: 2000,
            panelId: '',
            warnData: false
        }
    },
    computed: {
        warnbeforeclose(){ return this.warn || this.warnData }
    },
    methods:{
        outsideModal(e){
            if(!this.$refs.modalContainer) //double click outside modal, the ref doesn't exist by the time the second click is triggered
                return false
            //Note for vlModalClose: I deleted @mouse.stop="closeAction"
            //cuz clicking on the (X) is the same as clicking outside the modal.
            return !e.target.classList.contains('vlModalContainer') 
                && !this.$refs.modalContainer.contains(e.target)
        },
        warnConfirmation(){ 
            return !this.warnbeforeclose || (this.warnbeforeclose && confirm(this.warnbeforeclose))
        },
        mouseDown(e){
            if (this.outsideModal(e))
                this.readyToClose = true

            e.stopPropagation() //so that parent modals don't close too
        },
        mouseUp(e){
            if (this.outsideModal(e) && this.readyToClose)
                if(this.warnConfirmation()){
                    this.closeAction()
                }else{
                    this.readyToClose = false
                }

            e.stopPropagation() //so that parent modals don't close too
        },
        closeAction(){
            this.opened = false
            this.$emit('closed')
        },
        open(ajaxContent){
            this.opened = true
            this.readyToClose = false
            this.ajaxContent = ajaxContent ? true : false
            this.$emit('opened')
            //applies zIndex to the vlModalClose higher if in another modal
            this.$nextTick(()=> {
                var currentElem = this.$refs.modal
                while(currentElem.closest('.vlModalWrapper')){
                    this.zIndex += 100
                    currentElem = currentElem.closest('.vlModalWrapper').parentNode
                }
            })
        },
        next(){
            if(this.arrows)
                this.$emit('next')
        },
        previous(){
            if(this.arrows)
                this.$emit('previous')
        },
        $_attachEvents(){
            this.$_vlOn('vlModalShow'+this.name, (ajaxContent, warnbeforeclose) => {
                this.warnData = warnbeforeclose || false
                this.open(ajaxContent)
                if(this.arrows)
                    this.$nextTick(() => this.$refs.modal.focus()) //to be able to use keydown events
            })

            this.$_vlOn('vlModalClose'+this.name, () => {
                this.closeAction()
            })

            this.$_vlOn('vlModalShowFill'+this.name, (html) => {
                this.open(true)
                this.$nextTick(()=> {
                    this.$kompo.vlFillPanel(this.panelId, html)
                })
            })
        },
        $_destroyEvents(){
            this.$_vlOff([
                'vlModalShow'+this.name,
                'vlModalClose'+this.name,
                'vlModalShowFill'+this.name,
            ])
        }
    },
    created() {
        this.panelId = this.name !='default' ? this.name : 'vlDefaultModal'

        this.$_destroyEvents()
        this.$_attachEvents()
    },
    updated() {
        this.$_destroyEvents()
        this.$_attachEvents()
    }
}
</script>
