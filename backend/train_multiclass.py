import xgboost as xgb
import joblib
import os
from data_prep import load_training_data
from sklearn.metrics import classification_report, accuracy_score

def train_xgboost_model():
    """
    Train XGBoost multi-class classification model for aircraft issue prediction.

    Returns:
        tuple: (model, feature_names, accuracy)
    """
    # Load and preprocess data
    X_train, X_test, y_train, y_test, feature_names = load_training_data()

    # Define XGBoost parameters for multi-class classification with improved accuracy
    params = {
        'objective': 'multi:softprob',
        'num_class': 6,  # 6 issue types (0-5)
        'max_depth': 6,  # Balanced depth
        'learning_rate': 0.1,  # Standard learning rate
        'n_estimators': 150,  # Balanced number of estimators
        'subsample': 0.8,  # Standard subsample ratio
        'colsample_bytree': 0.8,  # Standard column sampling
        'gamma': 0.1,  # Standard minimum loss reduction
        'min_child_weight': 1,  # Minimum sum of instance weight
        'random_state': 42,
        'eval_metric': 'mlogloss'
    }

    # Create and train model
    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train)

    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print("XGBoost Model Training Results:")
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    return model, feature_names, accuracy

def save_model(model, feature_names, model_path='models/xgboost_model.joblib', features_path='models/feature_names.joblib'):
    """
    Save trained model and feature names.

    Args:
        model: Trained XGBoost model.
        feature_names (list): List of feature names.
        model_path (str): Path to save the model.
        features_path (str): Path to save feature names.
    """
    # Create models directory if it doesn't exist
    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    # Save model
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

    # Save feature names
    joblib.dump(feature_names, features_path)
    print(f"Feature names saved to {features_path}")

if __name__ == "__main__":
    # Train model
    model, feature_names, accuracy = train_xgboost_model()

    # Save model and features
    save_model(model, feature_names)

    print(f"\nTraining completed. Model accuracy: {accuracy:.4f}")
