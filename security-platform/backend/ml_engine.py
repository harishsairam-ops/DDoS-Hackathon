import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle
import os
import random

MODEL_PATH = "bot_model.pkl"
clf = None

def generate_synthetic_data(n_samples=1000):
    """
    Generates synthetic traffic data for training.
    Features:
    - request_rate: Requests per minute
    - path_diversity: Number of unique paths accessed / total requests
    - user_agent_score: 0 (bot-like) to 1 (normal)
    - avg_time_diff: Average time between requests
    
    Labels:
    - 0: Normal
    - 1: Bot
    """
    data = []
    labels = []
    
    # Generate Normal Traffic (Label 0)
    for _ in range(n_samples // 2):
        request_rate = random.uniform(1, 20)  # low rate
        path_diversity = random.uniform(0.5, 1.0) # visits many pages
        user_agent_score = 1.0 # clean UA
        avg_time_diff = random.uniform(2.0, 60.0) # slow human clicks
        
        data.append([request_rate, path_diversity, user_agent_score, avg_time_diff])
        labels.append(0)
        
    # Generate Bot Traffic (Label 1)
    for _ in range(n_samples // 2):
        # Bot Type 1: High Rate
        if random.random() > 0.5:
            request_rate = random.uniform(40, 100)
            path_diversity = random.uniform(0.1, 0.4) # hits same endpoints
            user_agent_score = random.choice([0.0, 0.5]) 
            avg_time_diff = random.uniform(0.01, 1.0)
        else:
            # Bot Type 2: Slow scraper but repetitive
            request_rate = random.uniform(5, 30)
            path_diversity = random.uniform(0.0, 0.2) # very repetitive
            user_agent_score = 0.0 # Bad UA
            avg_time_diff = random.uniform(1.0, 5.0)

        data.append([request_rate, path_diversity, user_agent_score, avg_time_diff])
        labels.append(1)
            
    return np.array(data), np.array(labels)

def train_model():
    """Trains a RandomForest model on synthetic data and saves it."""
    global clf
    print("Generating synthetic training data...")
    X, y = generate_synthetic_data()
    
    print("Training Random Forest model...")
    clf = RandomForestClassifier(n_estimators=50, max_depth=5)
    clf.fit(X, y)
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(clf, f)
    print(f"Model saved to {MODEL_PATH}")
    return clf

def load_model():
    """Loads the model from disk, or trains it if missing."""
    global clf
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, 'rb') as f:
                clf = pickle.load(f)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}. Retraining...")
            train_model()
    else:
        print("Model not found. Training new model...")
        train_model()

def predict_bot(features):
    """
    Predicts if a request is from a bot.
    Features: [request_rate, path_diversity, user_agent_score, avg_time_diff]
    Returns: (is_bot: bool, confidence: float)
    """
    global clf
    if clf is None:
        load_model()
        
    # Features must be 2D array
    X = np.array([features])
    
    # Probabilities: [prob_normal, prob_bot]
    probs = clf.predict_proba(X)[0]
    bot_prob = probs[1]
    
    return bot_prob > 0.5, bot_prob
