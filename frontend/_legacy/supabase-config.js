// Supabase Configuration for Frontend
import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ MISSING')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗ MISSING')
  throw new Error('Supabase configuration missing. Check .env.local file.')
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user
 * @param {Object} userData - { email, password, firstName, lastName, username }
 * @returns {Promise} User object
 */
export const registerUser = async (userData) => {
  try {
    console.log('Registering user:', userData.email)

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username,
        },
      },
    })

    if (authError) {
      console.error('Authentication error:', authError)
      throw authError
    }

    console.log('User registered successfully:', authData.user.id)

    // Insert user details into 'users' table
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          username: userData.username,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          password: authData.user.id, // For reference only, actual auth handled by Supabase Auth
        },
      ])
      .select()

    if (insertError) {
      console.error('Error inserting user to database:', insertError)
      throw insertError
    }

    return {
      userId: authData.user.id,
      email: authData.user.email,
      ...userData,
    }
  } catch (error) {
    console.error('Registration failed:', error.message)
    throw new Error(`Registration failed: ${error.message}`)
  }
}

/**
 * Login user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise} User object with session
 */
export const loginUser = async (email, password) => {
  try {
    console.log('Logging in user:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      throw error
    }

    // Fetch user details from 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      throw userError
    }

    console.log('User logged in successfully:', email)

    return {
      userId: data.user.id,
      email: data.user.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      username: userData.username,
      token: data.session.access_token,
    }
  } catch (error) {
    console.error('Login failed:', error.message)
    throw new Error(`Login failed: ${error.message}`)
  }
}

/**
 * Logout current user
 * @returns {Promise}
 */
export const logoutUser = async () => {
  try {
    console.log('Logging out user')
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    console.log('User logged out successfully')
  } catch (error) {
    console.error('Logout failed:', error.message)
    throw new Error(`Logout failed: ${error.message}`)
  }
}

/**
 * Get current authenticated user
 * @returns {Promise} User object
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error

    if (user) {
      // Fetch full user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.warn('Could not fetch user details:', userError)
        return user
      }

      return {
        userId: user.id,
        email: user.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        username: userData.username,
      }
    }

    return null
  } catch (error) {
    console.error('Error getting current user:', error.message)
    return null
  }
}

// ============================================
// DIABETES PREDICTION FUNCTIONS
// ============================================

/**
 * Save a diabetes prediction
 * @param {string} userId - User UUID
 * @param {Object} predictionData - Prediction details
 * @returns {Promise} Saved prediction
 */
export const savePrediction = async (userId, predictionData) => {
  try {
    console.log('Saving prediction for user:', userId)

    const { data, error } = await supabase
      .from('diabetes_predictions')
      .insert([
        {
          user_id: userId,
          pregnancies: predictionData.pregnancies,
          glucose: predictionData.glucose,
          blood_pressure: predictionData.bloodPressure,
          skin_thickness: predictionData.skinThickness,
          insulin: predictionData.insulin,
          bmi: predictionData.bmi,
          diabetes_pedigree_function: predictionData.diabetesPedigreeFunction,
          age: predictionData.age,
          prediction_result: predictionData.predictionResult,
          probability_no_diabetes: predictionData.probabilityNoDiabetes,
          probability_diabetes: predictionData.probabilityDiabetes,
          prediction_message: predictionData.predictionMessage,
        },
      ])
      .select()

    if (error) throw error

    console.log('Prediction saved successfully')
    return data[0]
  } catch (error) {
    console.error('Error saving prediction:', error.message)
    throw new Error(`Failed to save prediction: ${error.message}`)
  }
}

/**
 * Get all predictions for a user
 * @param {string} userId - User UUID
 * @returns {Promise} Array of predictions
 */
export const getPredictions = async (userId) => {
  try {
    console.log('Fetching predictions for user:', userId)

    const { data, error } = await supabase
      .from('diabetes_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log('Predictions fetched:', data.length)
    return data
  } catch (error) {
    console.error('Error fetching predictions:', error.message)
    throw new Error(`Failed to fetch predictions: ${error.message}`)
  }
}

/**
 * Get a single prediction by ID
 * @param {string} predictionId - Prediction UUID
 * @returns {Promise} Prediction object
 */
export const getPredictionById = async (predictionId) => {
  try {
    const { data, error } = await supabase
      .from('diabetes_predictions')
      .select('*')
      .eq('id', predictionId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching prediction:', error.message)
    throw new Error(`Failed to fetch prediction: ${error.message}`)
  }
}

/**
 * Delete a prediction
 * @param {string} predictionId - Prediction UUID
 * @returns {Promise}
 */
export const deletePrediction = async (predictionId) => {
  try {
    console.log('Deleting prediction:', predictionId)

    const { error } = await supabase
      .from('diabetes_predictions')
      .delete()
      .eq('id', predictionId)

    if (error) throw error

    console.log('Prediction deleted successfully')
  } catch (error) {
    console.error('Error deleting prediction:', error.message)
    throw new Error(`Failed to delete prediction: ${error.message}`)
  }
}

/**
 * Get predictions by result
 * @param {number} result - Prediction result (0 or 1)
 * @returns {Promise} Array of predictions
 */
export const getPredictionsByResult = async (result) => {
  try {
    const { data, error } = await supabase
      .from('diabetes_predictions')
      .select('*')
      .eq('prediction_result', result)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching predictions by result:', error.message)
    throw new Error(`Failed to fetch predictions: ${error.message}`)
  }
}

/**
 * Subscribe to real-time updates for user's predictions
 * @param {string} userId - User UUID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToPredictions = (userId, callback) => {
  console.log('Subscribing to predictions for user:', userId)

  const subscription = supabase
    .channel(`predictions:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'diabetes_predictions',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Real-time update received:', payload)
        callback(payload)
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    console.log('Unsubscribing from predictions')
    supabase.removeChannel(subscription)
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get current session
 * @returns {Promise} Session object
 */
export const getSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) throw error

    return session
  } catch (error) {
    console.error('Error getting session:', error.message)
    return null
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise} Boolean
 */
export const isAuthenticated = async () => {
  const session = await getSession()
  return session !== null
}

/**
 * Get auth state change listener
 * @param {Function} callback - Callback for auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  console.log('Setting up auth state listener')

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event)
    callback(event, session)
  })

  return data.subscription.unsubscribe
}
