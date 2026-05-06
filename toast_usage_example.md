### 1. Middleware for server.js
Already added to your `server.js`. It ensures `req.session.message` is passed to `res.locals` and cleared immediately.

```javascript
app.use((req, res, next) => {
  res.locals.message = req.session.message || null;
  delete req.session.message;
  next();
});
```

### 2. Partial usage in EJS pages
Include this at the bottom of your main layout or specifically in the pages you want notifications.

```ejs
<%- include("../partials/toast") %>
```

### 3. Controller Usage (Example)
Here is how you would use it in your controllers (e.g., `userController.js` or `adminController.js`).

```javascript
// Example: Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            // Set error message and redirect back
            req.session.message = {
                type: "error",
                text: "Invalid email or password!"
            };
            return res.redirect('/login');
        }

        // Set success message and redirect to dashboard
        req.session.message = {
            type: "success",
            text: "Welcome back, " + user.name + "!"
        };
        res.redirect('/dashboard');

    } catch (error) {
        req.session.message = {
            type: "error",
            text: "Something went wrong. Please try again."
        };
        res.redirect('/login');
    }
};
```

### 4. Simple Route Render (Example)
If you want to show a message directly on a render (without session redirect):

```javascript
router.get('/contact', (req, res) => {
    res.render('user/contact', {
        // You can also pass it directly if needed, but the middleware handles sessions
        // message: { type: "success", text: "Direct message test" } 
    });
});
```
