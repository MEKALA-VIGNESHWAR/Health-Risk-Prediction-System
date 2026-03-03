import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

data=pd.read_csv("diabetes.csv")

#split
x=data.drop("Outcome",axis=1)
y=data["Outcome"]

#train Test 
x_train,x_test,y_train,y_test = train_test_split(x,y,test_size=0.2,random_state=42)

#train model
log_model = LogisticRegression(max_iter=300)
log_model.fit(x_train,y_train)
log_pred = log_model.predict(x_test)
accuracy_log = accuracy_score(y_test,log_pred)

#save model
joblib.dump(log_model,"Diabetes_log_model.pkl")

print(accuracy_log)

probability=log_model.predict_proba(x_test)[0][1]
def risklevel(prob):
    if prob < 0.3 :
        return "Low Risk"
    elif prob>0.3 and prob < 0.7 :
        return "Medium Risk"
    else :
        return "High Risk"
print("Risk level",risklevel(probability))