Ajoute cette section **après le bloc “7.5 – Complete Workflow File”**, pour documenter clairement ton changement.

---

## **7.6 – Optional: Expose the UI with AWS LoadBalancer**

By default, the Helm chart exposes **UI services** (`vote-ui`, `result-ui`) as `NodePort` — suitable for local clusters (like Minikube).
On AWS EKS, we override this behavior in the CI/CD pipeline to create **public LoadBalancers** automatically.

This is achieved using the following flags in the Helm command:

```bash
--set voteUi.service.type=LoadBalancer \
--set resultUi.service.type=LoadBalancer
```

This tells Kubernetes to create an **internet-facing AWS LoadBalancer** for both UIs when deployed on EKS.

✅ **Effect:**

* Local deployment → NodePort (default in `values.yaml`)
* Cloud deployment (EKS) → LoadBalancer (via Helm override)

Once deployed, retrieve the external URLs:

```bash
kubectl get svc -n voting-app
```

Then open in your browser:

```
http://<EXTERNAL-IP-of-vote-ui>
http://<EXTERNAL-IP-of-result-ui>
```

---

This short addition keeps your lab consistent and documents exactly why those two `--set` options were added.
