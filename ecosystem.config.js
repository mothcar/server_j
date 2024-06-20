module.exports = {
  apps : [{
    name   : "server",
    script : "./app.js",
    watch : true,
    watch_delay: 5000,
    ignore_watch : ["node_modules", "Images","uploads", "\\.git", "*.log"],
  }]
}
