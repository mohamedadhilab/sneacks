const { generateOTP, saveOTP, verifyOTP } = require('../../utils/otpService');
const sendOtpMail = require('../../utils/mail');
const Admin = require('../../models/adminModel');
const bcrypt = require('bcrypt');
const User = require('../../models/userModel');

exports.getLogin = (req, res) => {
  res.render('admin/login', { error: null });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      req.session.message = {
        type: 'error',
        text: 'Admin not found'
      };
      return res.redirect('/admin/login');
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      req.session.message = {
        type: 'error',
        text: 'Invalid password'
      };
      return res.redirect('/admin/login');
    }

    req.session.admin = {
      id: admin._id,
      email: admin.email
    };

    req.session.message = {
      type: 'success',
      text: 'Welcome back, Admin!'
    };

    return res.redirect('/admin/dashboard');

  } catch (error) {
    console.log(error);
    res.send('Login error');
  }
};
exports.getDashboard = async (req, res) => {
  try {
    res.render('admin/dashboard'); 
  } catch (error) {
    console.log(error);
    res.send('Dashboard error');
  }
};

exports.logout = (req, res) => {

  delete req.session.admin;

  req.session.message = {
    type: 'success',
    text: 'Logged out successfully'
  };

  return res.redirect('/admin/login');
};

exports.getForgotPasswordPage = (req, res) => {
  res.render('admin/forgot-password', { error: null });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.render('admin/forgot-password', {
        error: 'Admin not found'
      });
    }

    const otp = generateOTP();

    await saveOTP(email, otp, 'admin-forgot');

    console.log('Admin OTP:', otp);

    await sendOtpMail(email, otp);

    return res.redirect(`/admin/otp?email=${email}&purpose=admin-forgot`);

  } catch (error) {
    console.log(error);
 req.session.message = {
    type: 'error',
    text: 'forgot password errorr'
  };  }
};

exports.getOtpPage = (req, res) => {
  const { email, purpose } = req.query;
  res.render('admin/otp', { email, purpose, error: null });
};

exports.verifyOtp = async (req, res) => {
  let { email, otp, purpose } = req.body;

  otp = otp.toString().trim();

  const isValid = await verifyOTP(email, otp, purpose);

  if (!isValid) {
    return res.render('admin/otp', {
      email,
      purpose,
      error: 'Invalid OTP'
    });
  }

  if (purpose === 'admin-forgot') {
    return res.redirect(`/admin/reset-password?email=${email}`);
  }
};

exports.getResetPage = (req, res) => {
  const { email } = req.query;
  res.render('admin/reset-password', { email });
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return  req.session.message = {
    type: 'error',
    text: 'password do not match'
  };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    return res.redirect('/admin/login');

  } catch (error) {
    console.log(error);
 req.session.message = {
    type: 'error',
    text: 'reset password error'
  };  }
};


exports.getUsers = async (req, res) => {

  try {

    const page = parseInt(req.query.page) || 1;

    const limit = 5;

    const skip = (page - 1) * limit;

    const search = req.query.search || '';

    const searchQuery = {

      $or: [

        {
          name: {
            $regex: search,
            $options: 'i'
          }
        },

        {
          email: {
            $regex: search,
            $options: 'i'
          }
        }

      ]

    };

    const users = await User.find(searchQuery)

      .sort({ createdAt: -1 })

      .skip(skip)

      .limit(limit);

    const totalUsers = await User.countDocuments(searchQuery);

    const activeUsers = await User.countDocuments({
      ...searchQuery,
      isBlocked: false
    });

    const totalPages = Math.ceil(totalUsers / limit);

    res.render('admin/users', {

      users,
      totalUsers,
      activeUsers,
      currentPage: page,
      totalPages,
      search

    });

  } catch (error) {

    console.log(error);

    req.session.message = {
      type: 'error',
      text: 'User page error'
    };

    res.redirect('/admin/dashboard');

  }

};
exports.blockUser = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.params.id },
      { $set: { isBlocked: true } }
    );

    req.session.message = {
      type: 'success',
      text: 'User has been blocked successfully.'
    };

    res.redirect('/admin/users');

  } catch (error) {
    console.log(error);
  }
};

exports.unblockUser = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.params.id },
      { $set: { isBlocked: false } }
    );

    req.session.message = {
      type: 'success',
      text: 'User has been unblocked successfully.'
    };

    res.redirect('/admin/users');

  } catch (error) {
    console.log(error);
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return req.session.message = {
      type: 'error',
      text: 'User not found'
    };
    }

    res.render('admin/user-details', {
    user,
    orders: []  
    });
  } catch (error) {
    console.log(error);
     req.session.message = {
      type: 'error',
      text: 'User detail error'
    };
  }
};