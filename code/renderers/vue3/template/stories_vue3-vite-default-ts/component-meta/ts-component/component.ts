import { defineComponent, h } from 'vue';

export default defineComponent({
  props: {
    /**
     * string foo
     */
    foo: {
      type: String,
      required: true,
    },
    /**
     * optional number bar
     */
    bar: {
      type: Number,
    },
  },
  setup(props) {
    return () => h('pre', JSON.stringify(props, null, 2));
  },
});
