Component({
  properties: {
    title: {
      type: String,
      value: ""
    },
    desc: {
      type: String,
      value: ""
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent("tapaction");
    }
  }
});
