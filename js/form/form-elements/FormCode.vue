<template>

    <pre v-if="!$_displayNone" v-show="!$_hidden" v-bind="$_attributes"
    ><code :style="{tabSize: tabSize}" class="language-php" v-html="$_label" /></pre>

</template>

<script>
import Other from '../mixins/Other'

export default {
    mixins: [Other],
    computed: {
        tabSize(){ return this.$_data('tabSize') || 4 }
    }
}
</script>
