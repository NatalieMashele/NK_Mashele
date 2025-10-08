import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { getDatabase, ref, get, set, update } from "firebase/database";
import { auth } from "../firebase";

const { width } = Dimensions.get("window");

const DetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonTextError}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = async () => {
    try {
      console.log("handleAddToCart fired for product id:", product?.id);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Login required", "Please log in to add items to your cart.");
        return;
      }

      const db = getDatabase();
      const cartRef = ref(db, `carts/${user.uid}/${product.id}`);

      const snapshot = await get(cartRef);
      if (snapshot.exists()) {
        const existing = snapshot.val();
        const newQty = (existing.quantity || 1) + 1;
        await update(cartRef, { quantity: newQty });
      } else {

        const item = {
          id: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: 1,
        };
        await set(cartRef, item);
      }

      Alert.alert("Added to Cart", `${product.title} has been added to your cart.`);
    } catch (err) {
      console.log("Add to cart error:", err);
      Alert.alert("Error", "Could not add to cart. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Product Details</Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.icon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>R{product.price.toFixed(2)}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {product.rating?.rate ?? "—"}</Text>
              <Text style={styles.ratingCount}>
                ({product.rating?.count ?? 0} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          activeOpacity={0.85}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.addToCartText}>Add to Cart 🛒</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  headerTitle: { 
    color: "white", 
    fontSize: 20, 
    fontWeight: "bold" 
  },
  backButton: { 
    padding: 5 
  },
  backArrow: { 
    color: "white", 
    fontSize: 22 
  },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 8,
    borderRadius: 8,
  },
  icon: { 
    color: "white", 
    fontSize: 18 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafc",
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: "#2563eb" 
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafc",
    padding: 20,
  },
  errorText: { 
    fontSize: 18, 
    color: "#dc2626", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  backButtonError: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonTextError: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "500" 
  },
  scrollContent: { 
    paddingBottom: 160 
  }, 
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { 
    width: width * 0.7, 
    height: width * 0.7, 
    resizeMode: "contain" 
  },
  detailsCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  category: {
    textTransform: "uppercase",
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#1e293b",
  marginBottom: 16,
  lineHeight: 28,
},

priceContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
},

price: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#2563eb",
},

ratingContainer: {
  alignItems: "flex-end",
},

rating: {
  fontSize: 16,
  fontWeight: "600",
  color: "#facc15",
},

ratingCount: {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 2,
},

divider: {
  height: 1,
  backgroundColor: "#e5e7eb",
  marginVertical: 16,
},

sectionTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#1e293b",
  marginBottom: 12,
},

description: {
  fontSize: 16,
  color: "#374151",
  lineHeight: 24,
},


  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: Platform.OS === "ios" ? 20 : 16,
    zIndex: 999,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  addToCartButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addToCartText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
});

export default DetailScreen;
