## **10.1 – Exposing the UI Services via LoadBalancer**

By default, both **`vote-ui`** and **`result-ui`** are exposed as **NodePort** services, which are accessible only inside the VPC.
To make them accessible from the Internet, you can modify the Helm chart to use a **LoadBalancer** instead.

---

### **1. Edit the Service Manifests**

Open these files:

```
voting-app/templates/vote-ui/service.yaml
voting-app/templates/result-ui/service.yaml
```

Change the `type` field from:

```yaml
spec:
  type: NodePort
```

to:

```yaml
spec:
  type: LoadBalancer
```

---

### **2. Add AWS LoadBalancer Annotations**

To ensure the LoadBalancer is public (internet-facing), add the following annotations under the `metadata` section:

```yaml
metadata:
  name: vote-ui
  labels:
    app: vote-ui
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-scheme: internet-facing
    service.beta.kubernetes.io/aws-load-balancer-type: external
```

Do the same for `result-ui`.

✅ **Example for `vote-ui/service.yaml`:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: vote-ui
  labels:
    app: vote-ui
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-scheme: internet-facing
    service.beta.kubernetes.io/aws-load-balancer-type: external
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 80
  selector:
    app: vote-ui
```

---

### **3. Redeploy the Helm Chart**

After editing the files, redeploy your app:

```bash
helm upgrade --install voting ./voting-app -n voting-app
```

Then check for the new external IP:

```bash
kubectl get svc vote-ui -n voting-app
```

You should now see an **AWS ELB hostname** under the `EXTERNAL-IP` column.

---

### **4. Access the Application**

Once the external IP is available, open in your browser:

```
http://<external-ip>:80
```

You’ll see the **Voting UI** live from your AWS LoadBalancer.

---

### **Why This Change Matters**

| Before                     | After (Helm + LoadBalancer)            |
| -------------------------- | -------------------------------------- |
| Required manual patch      | Automatically exposed via Helm         |
| NodePort (VPC only)        | Public ELB (internet-facing)           |
| Not persistent on redeploy | Persistent, part of Helm configuration |

---

**Result:**
The `vote-ui` and `result-ui` services are now managed directly by Helm and automatically exposed through AWS Elastic Load Balancers every time you deploy your app.

---

Souhaites-tu que je t’ajoute aussi le bloc équivalent pour un LoadBalancer **interne** (non public, pour réseau privé AWS) ?
