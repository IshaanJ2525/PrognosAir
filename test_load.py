from backend.utils import load_xgboost_model
model = load_xgboost_model()
print('Model loaded:', model is not None)
if model:
    print('base_score:', getattr(model, 'base_score', 'Not found'))
